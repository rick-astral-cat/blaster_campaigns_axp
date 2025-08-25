import React, {useEffect} from 'react';
import './styles.css'

class BlasterCampaign extends React.Component {
    componentDidMount() {
        // Check if element exists
        const containers = document.querySelectorAll(".work-area__container");
        containers.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.overflowY = "scroll";
          } else {
            console.warn("Element is not HTMLElement", el);
          }
        });
      }

    render() {
      return (
        <div className="neo-widget__content" style={{overflow: 'auto'}}>
            <div className="neo-widget__body" style={{overflow: 'unset !important'}}>

            <div class="container" id="blasterVoidApiAnswer">
              <div class="neo-widget__header">
                <h4>La consulta en la base de datos no arrojó información para el número entrante</h4>
              </div>
            </div>

            <div class="container" id="blasterExceptApiAnswer">
              <div class="neo-widget__header">
                <h4>Hubo una excepción en la comunicación, a continuación se despliega la información:</h4>
              </div>
              <h5 id="blasterExceptMessage">Es esto</h5>
            </div>
            
            {/* BLASTER CUSTOMER INFO ONCE API IS CALLED */}
            <div className="container" id="blasterCustomerInfo">
              <div class="neo-widget__header">
                <h4>Información de cliente</h4>
              </div>
              {/*** NOMBRES, APELLIDOS, CELULAR, CORREO ***/} 
              <div class="interactions-container">
                {/* NOMBRE */}
                <div 
                  class="int-cont-column"
                >
                  <label>Nombre</label>
                  <span dir="ltr" id="blasterNombre">Sin especificar</span>
                </div>
                {/* APELLIDOS */}
                <div 
                  class="int-cont-column"
                >
                  <label >Apellidos</label>
                  <span dir="ltr" id="blasterApellidos">Sin especificar</span>
                </div>
              </div>
              <div class="interactions-container">
                {/* CELULAR */}
                <div 
                  class="int-cont-column"
                >
                  <label >Celular contactado</label>
                  <span dir="ltr" id="blasterCelular">Sin especificar</span>
                </div>
                {/* CORREO */}
                <div 
                  class="int-cont-column"
                  style={{ display: 'none' }}
                >
                  <label >Correo</label>
                  <span dir="ltr" id="blasterCorreo">Sin especificar</span>
                </div>
              </div>
                <button class="neo-icon-redo" id="iconReload" style={{
                  fontSize: '24px',
                  backgroundColor: 'white',
                  border: 'none',
                  marginRight: '14px',
                  paddingBottom: '5px',
                  display: 'none',
                  cursor: 'pointer'
                }} onClick={() => {
                  alert('Ayuda');
                }}></button>

                <div class="neo-widget__header">
                  <h4>Datos del Automovil</h4>
                </div>
                {/*** REGION, MARCA, AGENCIA, MODELO DE AUTO, AÑO, FECHA DE ENTREGA, FECHA DE SERVICIO, DISTRIBUIDOR ***/} 
              <div class="interactions-container">
                {/* REGION */}
                <div 
                  class="int-cont-column"
                >
                  <label>Región</label>
                  <span dir="ltr" id="blasterRegion">Sin especificar</span>
                </div>
                {/* MARCA */}
                <div 
                  class="int-cont-column"
                >
                  <label >Marca</label>
                  <span dir="ltr" id="blasterMarca">Sin especificar</span>
                </div>
              </div>
              <div class="interactions-container">
                {/* AGENCIA */}
                <div 
                  class="int-cont-column"
                >
                  <label>Agencia</label>
                  <span dir="ltr" id="blasterAgencia">Sin especificar</span>
                </div>
                {/* MODELO DE AUTO */}
                <div 
                  class="int-cont-column"
                >
                  <label >Modelo</label>
                  <span dir="ltr" id="blasterModeloAuto">Sin especificar</span>
                </div>
              </div>
              <div class="interactions-container">
                {/* AÑO */}
                <div 
                  class="int-cont-column"
                >
                  <label>Año</label>
                  <span dir="ltr" id="blasterAnio">Sin especificar</span>
                </div>
                {/* DISTRIBUIDOR */}
                <div 
                  class="int-cont-column"
                >
                  <label>Distribuidor</label>
                  <span dir="ltr" id="blasterDistribuidor">Sin especificar</span>
                </div>
              </div>
              <div class="interactions-container">
                {/* FECHA DE ENTREGA */}
                <div 
                  class="int-cont-column"
                  style={{ display: 'none' }}
                >
                  <label>Fecha de entrega</label>
                  <span dir="ltr" id="blasterFechaEntrega">Sin especificar</span>
                </div>
                {/* FECHA DE SERVICIO */}
                <div 
                  class="int-cont-column"
                >
                  <label >Fecha de servicio</label>
                  <span dir="ltr" id="blasterFechaServicio">Sin especificar</span>
                </div>
              </div>
            </div>

            {/* MESSAGE WHILE LOADING API */}
            <div class="container" id="blasterLoadingMessage">
              <div class="neo-widget__header">
                <h4>Consultando informacion del cliente...</h4>
              </div>
            </div>

            </div>
        </div>
      );
    }
  }

  export default BlasterCampaign;