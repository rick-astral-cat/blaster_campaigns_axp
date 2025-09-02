import {createElement} from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import BlasterCampaign from './BlasterCampaign';

class BlasterCampaignComp extends HTMLElement {

    currentInteractions: any;

    formatearFecha(fechaStr) {
      const [year, month, day] = fechaStr.split("-").map(Number);
      const fecha = new Date(year, month - 1, day);

      let fechaT = new Intl.DateTimeFormat('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(fecha);
      console.log("Esta es la fecha transformada: ", fechaT);
      return fechaT;
    }

    showBlasterInformationOnApiCalled (){
      const blasterCustInfoDiv = document.getElementById('blasterCustomerInfo');
      const blasterLoagingDiv = document.getElementById('blasterLoadingMessage');
      if (blasterCustInfoDiv) blasterCustInfoDiv.style.display = "block";
      if (blasterLoagingDiv) blasterLoagingDiv.style.display = "none";
    }

    //Funcion para procesar llamada de RT4
    async procesarLlamadaRT4(url:string){
        //Call API of Blaster Campaigns
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    "Accept": "application/json",
                    // Agrega headers si es necesario
                }
            });

            if (!response.ok) {
                const errorData = await response.json(); // <-- Intenta leer el cuerpo JSON
                const errorMessage = errorData?.error || `Ha ocurrido un error: ${response.status}`;
                const blasterExceptAnswerDiv = document.getElementById('blasterExceptApiAnswer');
                if (blasterExceptAnswerDiv) blasterExceptAnswerDiv.style.display = "block";

                const blasterExceptMessage = document.getElementById('blasterExceptMessage');
                if (blasterExceptMessage) {
                    blasterExceptMessage.style.display = "block";
                    blasterExceptMessage.textContent = errorMessage;
                }

                this.showBlasterInformationOnApiCalled()

                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Respuesta de la API:', data);

            if (!data || data.length === 0) {
                console.warn('No se encontraron datos para el número e identificador enviados por RT4');
                const blasterVoidAnswerDiv = document.getElementById('blasterVoidApiAnswer');
                if (blasterVoidAnswerDiv) blasterVoidAnswerDiv.style.display = "block";

                this.showBlasterInformationOnApiCalled();
                return;
            }

            const customer = data[0]; // usamos solo el primer resultado

            if (customer) {
                const fields = {
                    Nombre: customer.nombre,
                    Apellidos: customer.apellidos,
                    Celular: customer.celular,
                    Correo: customer.correo,
                    Region: customer.region,
                    Marca: customer.marca,
                    Agencia: customer.agencia,
                    ModeloAuto: customer.modelo_auto,
                    Anio: customer.anio,
                    Distribuidor: customer.distribuidor,
                    FechaEntrega: this.formatearFecha(customer.fecha_entrega),
                    FechaServicio: this.formatearFecha(customer.fecha_servicio)
                };

                Object.entries(fields).forEach(([key, value]) => {
                    const el = document.getElementById(`blaster${key}`);
                    if (el) el.textContent = value;
                });
            }

            //Hide loading message and show API data
            this.showBlasterInformationOnApiCalled();

            const observer = new MutationObserver((mutationsList, observer) => {
                const container = document.querySelector('div.participant-info');
                if (container) {
                    console.log("Participant infor container found, stopping mutationObserver")
                    observer.disconnect(); // Dejar de observar

                    const customerData = [
                        `(Campaña) ${customer.nombre} ${customer.apellidos}`,
                        customer.celular
                    ];
                    const spans = container.querySelectorAll('span.long-text');

                    let i = 0;
                    spans.forEach((span) => {
                        span.textContent = customerData[i];
                        i++;
                    });
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });

            // Manejar la respuesta de la API
        } catch (error) {
            const blasterExceptAnswerDiv = document.getElementById('blasterExceptApiAnswer');
            if (blasterExceptAnswerDiv) blasterExceptAnswerDiv.style.display = "block";

            const blasterExceptMessage = document.getElementById('blasterExceptMessage');
            if (blasterExceptMessage) {
                blasterExceptMessage.style.display = "block";
                blasterExceptMessage.textContent = "" + error;
            }
            console.error('Error al hacer la llamada a la API:', error);
        }
    }

    connectedCallback () {
      render(createElement(BlasterCampaign), this)

      var api2 = (window as any).WS.widgetAPI();

      api2.onDataEvent('onContextDataEvent', async (Data) => {

      this.currentInteractions = api2.getAllInteractions();
      const voiceInteraction = this.currentInteractions.filter(interaction => interaction.channel === "VOICE");

      //TEST REFACTOR

      if (voiceInteraction.length > 0) {
          const interaction = voiceInteraction[0];
          console.log("Interactions retrieved: ", this.currentInteractions);
          console.log("Interaction to use: ", interaction);

          let engagementParams = interaction.intrinsics.ENGAGEMENT_PARAMETERS;
          let isRT4Call = false;
          let callerNameWithId = "";
          let url = "";

          // 🔎 Detectar si es RT4
          if (engagementParams) {
              try {
                  const parsedParams = JSON.parse(engagementParams);
                  if (parsedParams.Numero) {
                      isRT4Call = true;
                      callerNameWithId = parsedParams.Numero;

                      const callerName = callerNameWithId.slice(0, 10);
                      const aniIndentification = callerNameWithId.slice(10);

                      url = `https://dalton.onekey.mx:8443/api/ani/all?celular=${encodeURIComponent(
                          callerName
                      )}&identificador_auto=${encodeURIComponent(aniIndentification)}`;

                      console.log("Llamada RT4 detectada:", callerName, aniIndentification);
                  }
              } catch (error) {
                  const blasterExceptAnswerDiv = document.getElementById('blasterExceptApiAnswer');
                  if (blasterExceptAnswerDiv) blasterExceptAnswerDiv.style.display = "block";

                  const blasterExceptMessage = document.getElementById('blasterExceptMessage');
                  if (blasterExceptMessage) {
                      blasterExceptMessage.style.display = "block";
                      blasterExceptMessage.textContent = "" + error;
                  }
                  console.error('No se pudo parseas engagement parameters:', error);
                  return;
              }
          }

          // ✅ Si es RT4 → seguir flujo actual
          if (isRT4Call) {
              await this.procesarLlamadaRT4(url);
          }
          // ❌ Si no es RT4 → simular click en un objeto del DOM
          else {
              console.log("Llamada normal detectada, simulando click...");

              //Create MutationObserver for this virtual click when <li> appears
              const observer = new MutationObserver((mutationsList, observer) => {
                  const tab = document.querySelectorAll("ws-interaction-panel ul.neo-tabs__nav li")[0];
                  if (tab) {
                      console.log("Tab encontrada, simulando click y deteniendo observer");
                      observer.disconnect(); // dejamos de observar

                      (tab as HTMLElement).click();
                  }
              });

              observer.observe(document.body, {
                  childList: true,
                  subtree: true,
              });
          }
      }
      //END REFACTOR
          
      })
    }

    disconnectedCallback () {
        unmountComponentAtNode(BlasterCampaign)
    }

  }

  customElements.define('blaster-campaign-comp', BlasterCampaignComp);
