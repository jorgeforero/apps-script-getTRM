/**
 * getTRM
 * Obtiene el valor de la TRM del dólar con respecto al peso para la fecha actual
 * 
 * @param {void} - void
 * @return {void} - Datos de la TRM obtenidos desde la fuente con el valor y las fechas de vigencia
 */
function getTRM() {
  // Hace un request tipo POST con un payload en XML
  let date = Utilities.formatDate( new Date(), 'GMT-5', 'yyyy-MM-dd' );
  var xml = `<Envelope xmlns=\"http://schemas.xmlsoap.org/soap/envelope/\">
              <Body>
                  <queryTCRM xmlns=\"http://action.trm.services.generic.action.superfinanciera.nexura.sc.com.co/\">
                  <tcrmQueryAssociatedDate xmlns=\"\">${date}</tcrmQueryAssociatedDate>
                  </queryTCRM>
              </Body>
            </Envelope>`;
  // Objeto con las opciones que recibe el urlfetch 
  var options = {
    'method': 'post',
    'contentType': 'text/xml',
    'muteHttpExceptions': true,
    'payload': xml
  };
  let response = UrlFetchApp.fetch('https://www.superfinanciera.gov.co/SuperfinancieraWebServiceTRM/TCRMServicesWebService/TCRMServicesWebService', options );
  // Usando el parse se valida la respuesta obtenida
  const xmlResponse = XmlService.parse( response );
  const root = xmlResponse.getRootElement();
  // Convierte la respuesta a JSON 
  const obj = elementToJSON( root );
  console.log( `Objeto JSON>> ${JSON.stringify( obj, null, 2).replace('\\/g', '')}`);
  // Formateo de las fechas
  const dfrom = Utilities.formatDate( new Date( obj.Body.queryTCRMResponse.return.validityFrom ), 'GMT-5', 'yyyy-MM-dd HH:mm:ss');
  const dto = Utilities.formatDate( new Date( obj.Body.queryTCRMResponse.return.validityTo ), 'GMT-5', 'yyyy-MM-dd HH:mm:ss');
  // Resultado
  console.log( ` >> TRM ${obj.Body.queryTCRMResponse.return.value.Text}` );
  console.log( ` >> Vigencia desde: ${dfrom} hasta ${dto}` );
};

/**
 * elementToJSON
 * A function to convert an XML string to a JSON object in Apps Script, using logic similar to the sunset method Xml.parse()
 * Tomado de: https://gist.github.com/erickoledadevrel/6b1e9e2796e3c21f669f
 * 
 * @param {xml} element - Elemento XML a procesar
 * @return {object} result - Objeto tipo JSON generado a partir de element
 */
function elementToJSON( Element ) {
  var result = {};
  // Attributes.
  Element.getAttributes().forEach(function ( attribute ) {
    result[ attribute.getName() ] = attribute.getValue();
  });
  // Child elements.
  Element.getChildren().forEach( function ( child ) {
    var key = child.getName();
    var value = elementToJSON( child );
    if (result[key]) {
      if ( !(result[key] instanceof Array) ) {
        result[key] = [result[key]];
      }
      result[key].push(value);
    } else {
      result[key] = value;
    }
  });
  // Text content.
  if ( Element.getText() ) {
    result['Text'] = Element.getText();
  }
  return result;
};
