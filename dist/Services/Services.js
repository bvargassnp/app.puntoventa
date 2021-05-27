sap.ui.define(["Ventas/Vitrinav2/utils/Constants"],function(e){"use strict";return{_oModel:null,getOdataModel:function(e){if(this._oModel){return this._oModel}this._oModel=new sap.ui.model.odata.ODataModel(e,{json:true,headers:{DataServiceVersion:"2.0","Cache-Control":"no-cache, no-store",Pragma:"no-cache"}});return this._oModel},callGetService:function(t,n,i){const r=this.getOdataModel(e.endPoint.BACKEND);return new Promise((e,o)=>{r.read(t,{urlParameters:{$select:n},filters:i,success:e,error:o})})},callGetServiceToEntity:function(t){const n=this.getOdataModel(e.endPoint.BACKEND);return new Promise((e,i)=>{n.read(t,{success:e,error:i})})},callPostService:function(t,n){const i=this.getOdataModel(e.endPoint.BACKEND);return new Promise((e,r)=>{i.create(t,n,{success:e,error:r})})},postSolicitud:function(t){return this.callPostService(e.entity.SOLICITUD,t)},getEquipos:function(){return this.callGetService(e.entity.EQUIPO)},getLotes:function(t){return this.callGetService(e.entity.PEDIDOS,"CHARG",t)},getMateriales:function(t){return this.callGetServiceToEntity(e.entity.MATERIALES)},getEspecies:function(t){return this.callGetService(e.entity.PEDIDOS,"ESPECIE",t)},getCentros:function(t){return this.callGetServiceToEntity(e.entity.CENTROS)},getAlmacenes:function(t){return this.callGetServiceToEntity(e.entity.ALMACENES)},getCanales:function(t){return this.callGetServiceToEntity(e.entity.CANALES)}}});