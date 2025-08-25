import {createElement} from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import BlasterCampaign from './BlasterCampaign';

class BlasterCampaignComp extends HTMLElement {

    currentInteractions: any;


    formatearFecha(fechaStr) {
      const fecha = new Date(fechaStr);
      return new Intl.DateTimeFormat('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(fecha);
    }

    showBlasterInformationOnApiCalled (){
      const blasterCustInfoDiv = document.getElementById('blasterCustomerInfo');
      const blasterLoagingDiv = document.getElementById('blasterLoadingMessage');
      if (blasterCustInfoDiv) blasterCustInfoDiv.style.display = "block";
      if (blasterLoagingDiv) blasterLoagingDiv.style.display = "none";
    }

    connectedCallback () {
      render(createElement(BlasterCampaign), this)

      var api2 = (window as any).WS.widgetAPI();

      api2.onDataEvent('onContextDataEvent', async (Data) => {

      this.currentInteractions = api2.getAllInteractions();
      const voiceInteraction = this.currentInteractions.filter(interaction => interaction.channel === "VOICE");

      if (this.currentInteractions){
        console.log("Interactions retrieved: ", this.currentInteractions);
        console.log("Interaction to use: ", voiceInteraction);
        let url = "";

        //En caso de que la infromacion que es enviada de RT4 tenga errores de estructura o este faltante
        try{
          //Test variable, uncomment to do tests
          let callerNameWithId = "3328341462019";

          //Comment these two lines to tests
          //let engagementParams = voiceInteraction[0].intrinsics.ENGAGEMENT_PARAMETERS;
          //let callerNameWithId = JSON.parse(engagementParams).Numero;

          //let callerNameWithId = this.currentInteractions[0].intrinsics.CALLER_NAME;
          //callerNameWithId = callerNameWithId.replace(/\D/g, '').slice(-11);

          //Caso de que el numero venga al inicio y los demás digitos al final
          let callerName = callerNameWithId.slice(0, 10);
          let aniIndentification = callerNameWithId.slice(10)

          //Caso de que manden primero el identificador y despues los 10 digitos
          //let callerName = callerNameWithId.slice(0, 10);
          //let aniIndentification = callerNameWithId.slice(10)

          url = `https://dalton.onekey.mx:8443/api/ani/all?celular=${encodeURIComponent(callerName)}&identificador_auto=${encodeURIComponent(aniIndentification)}`;
          //this.setDefaultInteractionData(this.currentInteractions[0])
          //this.currentInteractions[0].intrinsics.CALLER_NAME contains caller any
          console.log("Esta es la informacion de la interaction: ", callerName, " - ", aniIndentification);
        }

        catch (error){
          const blasterExceptAnswerDiv = document.getElementById('blasterExceptApiAnswer');
          if (blasterExceptAnswerDiv) blasterExceptAnswerDiv.style.display = "block";

          const blasterExceptMessage = document.getElementById('blasterExceptMessage');
          if (blasterExceptMessage) {
            blasterExceptMessage.style.display = "block";
            blasterExceptMessage.textContent = "" + error;
          }
          console.error('Error al hacer la llamada a la API:', error);
          return;
        }
        

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

        //Change Number showed by Avaya AXP for a custom message
        /*const container = document.querySelector('div.participant-info');
        console.log("Este es el container: ", container);
        if (container) {
          const customerData = [
            `(Campaña) ${customer.nombre} ${customer.apellidos}`,
            customer.celular
          ];
          const spans = container.querySelectorAll('span.long-text');
          console.log("Estos son los spans: ", spans);

          let i = 0;
          if (spans){
            spans.forEach((span) => {
                span.textContent = customerData[i];
                i++; 
            });
          }
        }*/
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
      } //End of if existis current interaction
          
      })
    }

    disconnectedCallback () {
        unmountComponentAtNode(BlasterCampaign)
    }

  }

  customElements.define('blaster-campaign-comp', BlasterCampaignComp);
