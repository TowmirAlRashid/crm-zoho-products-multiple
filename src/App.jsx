import { Autocomplete, Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";

const ZOHO = window.ZOHO;

function App() {
  const [initialized, setInitialized] = useState(false) //initializing widget
  const [entity, setEntity] = useState() //module entity 
  const [entityId, setEntityId] = useState() //module id

  const [contactSubform, setContactSubform] = useState([]) //subform of contatcts module that holds the product list
  const [availableProducts, setAvailableProducts] = useState([]) //available product list taken from products module
  const [productId, setProductId] = useState()  //product id


  const { register, control, handleSubmit, watch } = useForm({ //creating the default form
    defaultValues: {
      test: [{ Product_Item: {}, Unit_Price: 0, Product_Name: "", Product_Code: "", Quantity: 0, Total: ""  }]
    }
  });

  const { fields, append, remove } = useFieldArray(  //field array that controls each row
    {
      control,
      name: "test"
    }
  );

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
        setContactSubform(data?.data?.[0]?.Submform_of_Contacts)
      })

      ZOHO.CRM.API.getAllRecords({Entity:"Products",sort_order:"asc"})
      .then(function(data){
        setAvailableProducts(data?.data)
      })
    }
  }, [initialized, entity, entityId])

  const priceTotal = (quantity, unitPrice) => {
    console.log(quantity, unitPrice);
    let finalPrice = Number(quantity) * Number(unitPrice);
    console.log({finalPrice})
    return finalPrice;
  }

  return (
    <div>
      <Box
        component="form"
        noValidate
        sx={{
          width: "90%",
          m: "2rem auto 1.5rem",
        }}
      >
        <Typography sx={{ textAlign: "center", mb: "2rem" }} variant="h6">
          Add New Products
        </Typography>

        <Paper sx={{
          width: "100%",
          overflowX: "auto",
          margin: '2rem auto'
        }}>
          <Table sx={{ width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell align="left" sx={{ width: '300px'}}>Product Item</TableCell>
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
                          name={`test[${index}].Product_Name`}
                          control={control}
                          defaultValue={row.Product_Name} 
                          //onChange={(_, data) => data}
                          render={({ onchange, ...props }) => (
                            <Autocomplete 
                              disablePortal
                              options={availableProducts?.map(product => product?.Product_Name)}
                              renderInput={(params) => <TextField {...params} label='Product Names' />}
                              onChange={(e, value) => {
                                setProductId(availableProducts?.filter(product => product?.Product_Name === value)?.[0]?.id)
                              }}
                              {...props}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                            name={`test[${index}].Unit_Price`}
                            control={control}
                            defaultValue={row.Unit_Price} 
                            //onChange={(_, data) => data}
                            render={({ onchange, ...props }) => (
                              <TextField 
                                variant="standard"
                                defaultValue={`${row.Unit_Price}`}
                                {...props}
                              />
                            )}
                          />
                      </TableCell>
                      <TableCell>
                        <Controller
                            name={`test[${index}].Product_Code`}
                            control={control}
                            defaultValue={row.Product_Code} 
                            //onChange={(_, data) => data}
                            render={({ onchange, ...props }) => (
                              <TextField 
                                variant="standard"
                                defaultValue={`${row.Product_Code}`}
                                {...props}
                              />
                            )}
                          />
                      </TableCell>
                      <TableCell>
                        <Controller
                            name={`test[${index}].Quantity`}
                            control={control}
                            defaultValue={row.Quantity} 
                            //onChange={(_, data) => data}
                            render={({ onchange, ...props }) => (
                              <TextField 
                                variant="standard"
                                defaultValue={`${row.Quantity}`}
                                {...props}
                              />
                            )}
                          />
                      </TableCell>
                      <TableCell>
                        <Controller
                            name={`test[${index}].Total`}
                            control={control} 
                            //onChange={(_, data) => data}
                            render={({ onchange, ...props }) => (
                              <TextField 
                                variant="standard"
                                sx={{pointerEvents: 'none'}}
                                {...props}
                                value={console.log((watch(fields?.[index]?.Unit_Price) || 0, watch(fields?.[index]?.Quantity) || 0))}
                              />
                            )}
                          />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='contained'
                          onClick={() => remove(index)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              }
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </div>
  );
}

export default App;
