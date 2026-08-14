import React, { useRef, useEffect, useCallback } from "react";
import { Platform, View } from "react-native";

// WebView is native-only; requiring it conditionally keeps it out of the web bundle.
let WebView = null;
if (Platform.OS !== "web") {
  WebView = require("react-native-webview").WebView;
}

// Self-contained Leaflet map. CARTO light/dark tiles (no API key). Markers are circular
// divIcons colored by severity, with a status indicator: plain = Received, ring = Reviewed,
// check = Resolved. Communicates with RN: posts {type:'ready'|'select'}, receives apply().
const MAP_HTML = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
 html,body,#map{margin:0;height:100%;width:100%;background:#e9ede7}
 .pin{border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;position:relative}
 .pin .ring{width:42%;height:42%;border:2px solid #fff;border-radius:50%}
 .pin .chk{color:#fff;font-size:11px;font-weight:800;line-height:1}
 .pin .badge{position:absolute;top:-8px;right:-8px;min-width:16px;height:16px;padding:0 3px;border-radius:8px;background:#1C1C1E;color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;border:1px solid #fff}
</style></head><body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
 var map=L.map('map',{zoomControl:false,attributionControl:false}).setView([-22.57,17.083],12);
 var tiles=null, markers=[], userMarker=null, reports=[], filter='all';
 var SEV={CRITICAL:'#FF3B30',MEDIUM:'#FF9F0A',LIGHT:'#8E8E93'};
 function post(m){ if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(m);} else {parent.postMessage(m,'*');} }
 function setTiles(dark){
   if(tiles){map.removeLayer(tiles);}
   var url=dark?'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png':'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
   tiles=L.tileLayer(url,{maxZoom:19,subdomains:'abcd'}).addTo(map);
 }
 function iconFor(r){
   var color=SEV[r.severity]||'#8E8E93';
   var count=r.duplicate_count||1;
   var size=26+Math.min(count-1,6)*3;
   var inner=r.status==='RESOLVED'?'<div class="chk">&#10003;</div>':(r.status==='IN_PROGRESS'?'<div class="ring"></div>':'');
   var badge=count>1?'<div class="badge">'+count+'</div>':'';
   return L.divIcon({html:'<div class="pin" style="width:'+size+'px;height:'+size+'px;background:'+color+'">'+inner+badge+'</div>',className:'',iconSize:[size,size],iconAnchor:[size/2,size/2]});
 }
 function render(){
   markers.forEach(function(m){map.removeLayer(m);}); markers=[];
   reports.filter(function(r){
     if(filter==='all')return true;
     if(filter==='critical')return r.severity==='CRITICAL';
     return r.category===filter;
   }).forEach(function(r){
     if(r.latitude==null)return;
     var m=L.marker([r.latitude,r.longitude],{icon:iconFor(r)}).addTo(map);
     m.on('click',function(){post(JSON.stringify({type:'select',id:r.id}));});
     markers.push(m);
   });
 }
 function apply(d){
   if(d.reports){reports=d.reports;}
   if(d.filter!=null){filter=d.filter;}
   if(d.dark!=null){setTiles(!!d.dark);}
   if(d.user){ if(userMarker){map.removeLayer(userMarker);} userMarker=L.circleMarker([d.user.lat,d.user.lng],{radius:7,color:'#0A84FF',fillColor:'#0A84FF',fillOpacity:1,weight:3}).addTo(map); map.setView([d.user.lat,d.user.lng],14); }
   render();
 }
 window.apply=apply;
 window.addEventListener('message',function(e){ try{var d=typeof e.data==='string'?JSON.parse(e.data):e.data; if(d&&d.__map){apply(d.payload);}}catch(_){} });
 setTiles(false);
 post(JSON.stringify({type:'ready'}));
</script></body></html>`;

export default function MapSurface({ reports, filter, dark, userLoc, onSelect }) {
  const ref = useRef(null);
  const ready = useRef(false);

  const send = useCallback((payload) => {
    if (Platform.OS === "web") {
      ref.current?.contentWindow?.postMessage({ __map: true, payload }, "*");
    } else {
      ref.current?.injectJavaScript(`window.apply(${JSON.stringify(payload)}); true;`);
    }
  }, []);

  const handleMessage = useCallback((raw) => {
    let d; try { d = JSON.parse(raw); } catch { return; }
    if (d.type === "ready") {
      ready.current = true;
      send({ reports, filter, dark, user: userLoc ? { lat: userLoc.latitude, lng: userLoc.longitude } : undefined });
    } else if (d.type === "select") {
      onSelect(d.id);
    }
  }, [reports, filter, dark, userLoc, send, onSelect]);

  // Push updates once the map is ready.
  useEffect(() => { if (ready.current) send({ reports, filter, dark }); }, [reports, filter, dark, send]);
  useEffect(() => { if (ready.current && userLoc) send({ user: { lat: userLoc.latitude, lng: userLoc.longitude } }); }, [userLoc, send]);

  // On web, listen for iframe postMessages.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const h = (e) => { if (typeof e.data === "string") handleMessage(e.data); };
    window.addEventListener("message", h);
    return () => window.removeEventListener("message", h);
  }, [handleMessage]);

  if (Platform.OS === "web") {
    return React.createElement("iframe", {
      ref,
      srcDoc: MAP_HTML,
      style: { border: 0, width: "100%", height: "100%", display: "block" },
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={ref}
        originWhitelist={["*"]}
        source={{ html: MAP_HTML }}
        onMessage={(e) => handleMessage(e.nativeEvent.data)}
        style={{ flex: 1, backgroundColor: "transparent" }}
        scrollEnabled={false}
      />
    </View>
  );
}
