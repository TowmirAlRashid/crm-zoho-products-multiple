import { Autocomplete, Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";

const ZOHO = window.ZOHO;

function App() {
  const [initialized, setInitialized] = useState(false) //initializing widget
  const [entity, setEntity] = useState() //module entity 
  const [entityId, setEntityId] = useState() //module id

  const [contactSubform, setContactSubform] = useState([]) //subform of contatcts module that holds the product list
  const [availableProducts, setAvailableProducts] = useState([]) //available product list taken from products module

  // { Product_Item: null, Currency_1: 0, Product_Code: "", Quantity: 0, Total: ""  }

  const { control, watch, handleSubmit,  setValue } = useForm({ //creating the default form
    defaultValues: {
      test: contactSubform?.length > 0 ? contactSubform : [{ Product_Item: null, Currency_1: 0, Product_Code: "", Quantity: 0, Total: ""  }]
    }
  });

  const { fields, append, remove } = useFieldArray(  //field array that controls each row
    {
      control,
      name: "test"
    }
  );

 
  const stage = watch();

  useEffect(() => {  //rendered once during widget first load
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

  useEffect(() => { //re-rendered on change of the dependencies
    if (entity && entityId) {
      ZOHO.CRM.API.getRecord({Entity: entity, RecordID: entityId})
      .then(function(data){
        setContactSubform(data?.data?.[0]?.Submform_of_Contacts);
        setValue("test", (data?.data?.[0]?.Submform_of_Contacts?.length > 0 ? data?.data?.[0]?.Submform_of_Contacts : [{ Product_Item: null, Currency_1: 0, Product_Code: "", Quantity: 0, Total: ""  }]));
      })

      ZOHO.CRM.API.getAllRecords({Entity:"Products",sort_order:"asc"})
      .then(function(data){
        setAvailableProducts(data?.data)
      })
    }
  }, [initialized, entity, entityId, setValue])

  

  const onSubmit = (data) => {
    if (entity && entityId) {
      var config={
        Entity: "Contacts",
        APIData:{
          id: entityId,
          Submform_of_Contacts: [
            ...data.test
          ]
        },
        Trigger:["workflow"]
      }
      console.log(config);
      ZOHO.CRM.API.updateRecord(config)
      .then(function(data){
        if (data?.data?.[0]?.code === 'SUCCESS') {
          ZOHO.CRM.UI.Popup.closeReload()
          .then(function(data){
              console.log(data)
          })
        }
      })
    }
  }


  return (
    <div>
      <Box
        onSubmit={handleSubmit(onSubmit)}
        component="form"
        noValidate
        sx={{
          width: "90%",
          m: "2rem auto 1.5rem",
        }}
      >
        <Typography sx={{ textAlign: "center", mb: "2rem" }} variant="h6">
          Handle all the products of this Contact here!
        </Typography>
        <Paper
          sx={{
            width: "100%",
            overflowX: "auto",
            margin: "2rem auto",
          }}
        >
          <Table sx={{ width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell align="left" sx={{ width: "300px" }}>
                  Product Item
                </TableCell>
                <TableCell align="left">Unit Price ($)</TableCell>
                <TableCell align="left">Product Code</TableCell>
                <TableCell align="left">Quantity</TableCell>
                <TableCell align="left">Total</TableCell>
                <TableCell align="left">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                fields.map((row, index) => {
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Controller
                        name={`test[${index}].Product_Item`}
                        control={control}
                        render={({ field }) => {
                          return (
                            <Autocomplete
                              {...field}
                              disablePortal
                              options={availableProducts?.map(
                                (product) => {return {name: product.Product_Name, id: product.id, Currency_1: product.Unit_Price, Product_Code: product.Product_Code}}
                              )}
                              getOptionLabel={(option) => option.name}
                              onChange={(_, data) => {
                                field.onChange({ name: data?.name, id: data?.id})
                                setValue(`test[${index}].Currency_1`, data?.Currency_1)
                                setValue(`test[${index}].Product_Code`, data?.Product_Code)
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Product Item"
                                />
                              )}
                            />
                          )
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`test[${index}].Currency_1`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            variant="standard"
                            sx={{ pointerEvents: "none" }}
                            {...field}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`test[${index}].Product_Code`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            variant="standard"
                            sx={{ pointerEvents: "none" }}
                            {...field}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`test[${index}].Quantity`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            variant="standard"
                            {...field}
                           onChange={(e)=> { setValue(`test[${index}].Total`, ((stage.test[index].Currency_1 || 0) * e.target.value).toString()); field.onChange(e.target.value) } }
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`test[${index}].Total`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            variant="standard"
                            sx={{ pointerEvents: "none" }}
                            {...field}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="contained" onClick={() => remove(index)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={() => {
              append({
                Product_Item: null,
                Currency_1: 0,
                Product_Code: "",
                Quantity: 0,
                Total: "",
              });
            }}
          >
            Add {`${ fields?.length === 0 ? 'A' : 'Another'}`} Product
          </Button>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            type="submit"
            variant="contained"
          >{`Update the ${fields?.length > 1 ? 'Products' : 'Product'} list?`}</Button>
        </Box>
      </Box>
    </div>
  );
}

export default App;
