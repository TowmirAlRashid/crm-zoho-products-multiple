import { useEffect, useState } from "react";


const ZOHO = window.ZOHO;

function App() {
  const [initialized, setInitialized] = useState(false)
  const [entity, setEntity] = useState()
  const [entityId, setEntityId] = useState()

  const [contactSubform, setContactSubform] = useState([])
  const [availableProducts, setAvailableProducts] = useState([])

  useEffect(() => {
    ZOHO.embeddedApp.on("PageLoad", function (data) {
      setEntity(data?.Entity);
      setEntityId(data?.EntityId?.[0])
    });

    ZOHO.embeddedApp.init().then(() => {
      ZOHO.CRM.UI.Resize({height: "600", width:"1000"}).then(function(data){
        console.log(data);
      });
      setInitialized(true)
    });
  }, [])

  useEffect(() => {
    if (entity && entityId) {
      ZOHO.CRM.API.getRecord({Entity: entity, RecordID: entityId})
      .then(function(data){
        setContactSubform(data?.data?.[0]?.Submform_of_Contacts)
      })

      ZOHO.CRM.API.getAllRecords({Entity:"Products",sort_order:"asc"})
      .then(function(data){
        setAvailableProducts(data?.data)
      })
    }
  }, [initialized, entity, entityId])

  return (
    <div>
      <h1>App</h1>
    </div>
  );
}

export default App;
