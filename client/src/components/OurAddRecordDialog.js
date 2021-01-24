import React, {useEffect, useState} from 'react';
import { withStyles } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import axios from 'axios';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import OurDatePicker from './OurDatePicker';
import DateFnsUtils from "@date-io/date-fns";
import moment from 'moment';

const styles = {
  rootDark: {
    color: purple[300],
    '&$checked': {
      color: purple[300],
    },
    paddingTop: '5px!important',
    paddingBottom: '5px!important'
  },
  rootLight: {
    color: purple[500],
    '&$checked': {
      color: purple[500],
    },
    paddingTop: '5px!important',
    paddingBottom: '5px!important'
  },
  checked: {},
};

const FormDialog = ({publicKey, refetchData, isLoading, isDarkMode, classes}) => {
  const [open, setOpen] = useState(false);
  const [coins, setCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(false);
  const [tokenQuantity, setTokenQuantity] = useState("");
  const [selectedDate, handleDateChange] = useState(new Date());

  const selectCoin = (event) => {
    let selectedId = event.target.value;
    setSelectedCoin(coins.filter(item => item.id === selectedId)[0]);
  }

  const handleTokenQuantityChange = (event) => {
    let tokenQuantityInput = event.target.value * 1;
    setTokenQuantity(tokenQuantityInput);
  }

  const addManualRecord = async () => {
    let manualRecord = {...selectedCoin};
    let currentLocalStorageRecords = localStorage.getItem("manualAccountEntries") ? JSON.parse(localStorage.getItem("manualAccountEntries")) : {};
    let type = 'buy';
    if(publicKey) {
      let publicKeyLowerCase = publicKey.toLowerCase();
      if(currentLocalStorageRecords[publicKeyLowerCase]){
        if(!currentLocalStorageRecords[publicKeyLowerCase][selectedCoin.id]){
          currentLocalStorageRecords[publicKeyLowerCase][selectedCoin.id] = {
            timeseries: []
          };
        }
        let useTokenQuantity = tokenQuantity;
        if(currentLocalStorageRecords[publicKeyLowerCase][selectedCoin.id] && currentLocalStorageRecords[publicKeyLowerCase][selectedCoin.id].tokenQuantity) {
          useTokenQuantity = currentLocalStorageRecords[publicKeyLowerCase][selectedCoin.id].tokenQuantity + tokenQuantity;
        }
        currentLocalStorageRecords[publicKeyLowerCase][selectedCoin.id] = {...manualRecord, timeseries: [...currentLocalStorageRecords[publicKeyLowerCase][selectedCoin.id].timeseries, {date: moment(selectedDate), price: tokenQuantity, type}], tokenQuantity: useTokenQuantity};
      }else{
          currentLocalStorageRecords[publicKeyLowerCase] = {};
          currentLocalStorageRecords[publicKeyLowerCase][selectedCoin.id] = {...manualRecord, timeseries: [{date: moment(selectedDate), price: tokenQuantity, type}], tokenQuantity: tokenQuantity};
      }
      localStorage.setItem("manualAccountEntries", JSON.stringify(currentLocalStorageRecords));
    }
    handleClose();
    await refetchData();
  }

    const tokenSearch = (event) => {
        let searchString = event.target.value ? event.target.value.toLowerCase() : "";
        if(searchString.length > 1) {
            let filteredList = coins.filter(item => {
                if(item.id.toLowerCase().indexOf(searchString) > -1) {
                    return true;
                } else if (item.symbol.toLowerCase().indexOf(searchString) > -1) {
                    return true;
                } else if (item.name.toLowerCase().indexOf(searchString) > -1) {
                    return true;
                }
            })
            if(filteredList.length === 0) {
                setFilteredCoins([{isNoResultsRecord: true}]);
            }else{
                setFilteredCoins(filteredList);
            }
            setSelectedCoin(false);
        }else{
            setSelectedCoin(false);
            setFilteredCoins([]);
        }
    }

  useEffect(() => {
    let isMounted = true;
    const getCoinList = async () => {
        let getCoinListURL = 'https://api.coingecko.com/api/v3/coins/list';
        let results = await axios.get(getCoinListURL);
        if(isMounted) {
            setCoins(results.data);
        }
    }
    getCoinList();

    // prevent memory leaks
    return () =>  { isMounted = false }
  }, [])

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFilteredCoins([]);
  };

  return (
    <div>
        <Button onClick={handleClickOpen} disabled={isLoading} color="primary" size="large" variant="outlined" style={{textTransform: 'none'}}>
          Add Record
        </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Add Holdings Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Find and select the relevant token along with how much of it is held
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Token Name"
            fullWidth
            onChange={(event) => tokenSearch(event)}
          />
            <div style={{maxHeight: '150px', overflowY: 'scroll'}}>
                <RadioGroup aria-label="tokenSearch" name="tokenSearchResults" onChange={selectCoin}>
                    {filteredCoins && filteredCoins.map(coin => (
                        <FormControlLabel value={coin.isNoResultsRecord ? "N/A" : coin.id} control={<Radio classes={isDarkMode ? {root: classes.rootDark, checked: classes.checked } : { root: classes.rootLight, checked: classes.checked }} checked={selectedCoin && selectedCoin.id === coin.id} disableRipple={true} size="small" disabled={coin.isNoResultsRecord ? true : false} />} label={coin.isNoResultsRecord ? "No Results Found" : coin.name + " (" +  coin.symbol.toUpperCase() + ")"} />
                    ))}
                </RadioGroup>
            </div>
          <TextField
            margin="dense"
            id="amountHeld"
            label="Amount Held"
            type="number"
            fullWidth
            onChange={handleTokenQuantityChange}
          />
            <div style={{marginTop: '10px'}}>
              <OurDatePicker
                  label="Date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  format="dd/MM/yyyy"
                  animateYearScrolling
                  fullWidth
                  isDarkMode={isDarkMode}
              />
            </div>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose} color="primary">
                Cancel
            </Button>
            <Button onClick={addManualRecord} color="primary">
                Add
            </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default withStyles(styles)(FormDialog);