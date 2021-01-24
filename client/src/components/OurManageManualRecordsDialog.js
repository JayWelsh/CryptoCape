import React, {useEffect, useState} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import OurManualRecordsTable from './OurManualRecordsTable';

export default function FormDialog({publicKey, refetchData, isLoading, isDarkMode, tokenId, overrideOpen, closeManualRecordManager}) {
  const [open, setOpen] = useState(false);
  const [manualEntries, setManualEntries] = useState(false);
  const [manualEntriesTokenId, setManualEntriesTokenId] = useState(false);

  useEffect(() => {
    if(overrideOpen !== open) {
        setOpen(overrideOpen);
    }
  },[overrideOpen])

  useEffect(() => {
      let useLocalStorageState = localStorage.getItem("manualAccountEntries");
      if(publicKey && useLocalStorageState !== JSON.stringify(manualEntries)) {
          let lowerCasePublicKey = publicKey.toLowerCase();
          let useParsedLocalStorageState = JSON.parse(useLocalStorageState);
          if(useParsedLocalStorageState && useParsedLocalStorageState[lowerCasePublicKey]){
              setManualEntries(useParsedLocalStorageState[lowerCasePublicKey])
              if(useParsedLocalStorageState[lowerCasePublicKey][tokenId]){
                  setManualEntriesTokenId(useParsedLocalStorageState[lowerCasePublicKey][tokenId]);
              }
          }
      }
  }, [localStorage.getItem("manualAccountEntries"), publicKey, tokenId])

  const handleClose = () => {
    if(closeManualRecordManager){
        closeManualRecordManager();
    }else{
        setOpen(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Manual {manualEntriesTokenId.name ? manualEntriesTokenId.name : "Token"} Records</DialogTitle>
        <DialogContent>
          <DialogContentText>
            View or remove manual records
          </DialogContentText>
          <OurManualRecordsTable
            publicKey={publicKey}
            refetchData={refetchData}
            handleClose={handleClose}
            tokenId={manualEntriesTokenId.id}
            symbol={manualEntriesTokenId.symbol && manualEntriesTokenId.symbol.toUpperCase()}
            timeseries={manualEntriesTokenId.timeseries && manualEntriesTokenId.timeseries.map((item, index) => {
                if(!item.type) {
                    item.type = 'buy';
                }
                item.id = index;
                return item;
            })}
          />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose} color="primary">
                Close
            </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}