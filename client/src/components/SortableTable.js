import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import OurAddRecordDialog from './OurAddRecordDialog';
import OurManageManualRecordsDialog from './OurManageManualRecordsDialog';
import { priceFormat } from '../utils';

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const rows = [
  { id: 'symbol', numeric: false, disablePadding: false, label: 'Symbol' },
  { id: 'token_value_usd', numeric: false, disablePadding: false, label: 'Token Value'},
  { id: 'value_usd', numeric: true, disablePadding: false, label: 'Portfolio Value' },
  { id: 'manual_record_count', numeric: true, disablePadding: false, label: 'Manual Entries' },
  { id: 'market_cap', numeric: true, disablePadding: false, label: 'Market Cap' },
  { id: 'balance', numeric: true, disablePadding: false, label: 'Tokens' },
  { id: 'portfolio_portion', numeric: true, disablePadding: false, label: 'Portfolio Portion'},
  { id: 'change_today', numeric: true, disablePadding: false, label: 'Token Value Change (Today)' },
  { id: 'relative_portfolio_impact_today', numeric: true, disablePadding: false, label: 'Relative Portfolio Impact (Today)'}
];

class EnhancedTableHead extends React.Component {
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, isDarkMode } = this.props;
    return (
      <TableHead>
        <TableRow>
          {rows.map(
            row => (
              <TableCell
                key={row.id}
                align={row.numeric ? 'right' : 'left'}
                padding={row.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === row.id ? order : false}
              >
                <Tooltip
                  title="Sort"
                  placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === row.id}
                    direction={order}
                    onClick={this.createSortHandler(row.id)}
                    style={isDarkMode ? { color: 'white' } : {}}
                  >
                    {row.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            ),
            this,
          )}
        </TableRow>
      </TableHead>
    );
  }
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const toolbarStyles = theme => ({
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    width: '100%',
    flex: '0 0 auto',
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
  },
  darkModeText: {
    color: 'white'
  }
});

let EnhancedTableToolbar = props => {
  const { numSelected, classes, isConsideredMobile, publicKey, refetchData, isLoading, isEth2DepositContract, isDarkMode } = props;

  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={[classes.title, "flex-space-between"].join(" ")}>
        <Typography className={isDarkMode ? classes.darkModeText : null} variant={isConsideredMobile ? "display1" : "display2"} id="tableTitle">
          Key Figures
        </Typography>
        {!isEth2DepositContract && <OurAddRecordDialog isDarkMode={isDarkMode} refetchData={refetchData} publicKey={publicKey} isLoading={isLoading}/>}
      </div>
      <div className={classes.spacer} />
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
};

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);

const styles = theme => ({
  root: {
    width: '100%',
  },
  table: {
    // minWidth: 1020,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  totalRow: {
    backgroundColor: '#3c42a40f',
  },
  nowrap: {
    whiteSpace: 'nowrap'
  }
});

class EnhancedTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            order: 'desc',
            orderBy: 'value_usd',
            selected: [],
            data: props.tableData || [],
            page: 0,
            rowsPerPage: 10,
            isEth2DepositContract: props.isEth2DepositContract,
            isDarkMode: props.isDarkMode,
            showManualRecordManager: false,
            manualRecordManagerTokenId: false,
        };
    }

    launchManualRecordManager = (coinId) => {
      const { manualRecordManagerTokenId, showManualRecordManager } = this.state;
      if(coinId && (manualRecordManagerTokenId !== coinId || !showManualRecordManager)) {
        this.setState({
          showManualRecordManager: true,
          manualRecordManagerTokenId: coinId
        })
      }
    }

    closeManualRecordManager = () => {
      this.setState({
        showManualRecordManager: false,
      })
    }

    componentWillUpdate(nextProps, prevProps) {
        let {data, isEth2DepositContract} = this.state;
        if((JSON.stringify(nextProps.tableData) !== JSON.stringify(data)) && (JSON.stringify(prevProps.tableData) !== JSON.stringify(nextProps.tableData))){
            this.setState({
                data: nextProps.tableData || [],
                rowsPerPage: nextProps.tableData.length || 10,
            })
        }
        if(nextProps.isEth2DepositContract !== isEth2DepositContract) {
          this.setState({
            isEth2DepositContract: nextProps.isEth2DepositContract
          })
        }
        if(nextProps.isDarkMode !== prevProps.isDarkMode) {
          this.setState({
            isDarkMode: nextProps.isDarkMode
          })
        }
    }

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  handleSelectAllClick = event => {
    if (event.target.checked) {
      this.setState(state => ({ selected: state.data.map(n => n.id) }));
      return;
    }
    this.setState({ selected: [] });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  render() {
    const { classes, publicKey, refetchData, isLoading } = this.props;
    const { data, order, orderBy, selected, rowsPerPage, page, isEth2DepositContract, isDarkMode, showManualRecordManager, manualRecordManagerTokenId } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
      <Paper className={classes.root}>
        <EnhancedTableToolbar isDarkMode={isDarkMode} isEth2DepositContract={isEth2DepositContract} refetchData={refetchData} numSelected={selected.length} publicKey={publicKey} isLoading={isLoading} />
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
              classes={classes}
              isDarkMode={isDarkMode}
            />
            <TableBody>
              {stableSort(data, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(n => {
                  const isSelected = this.isSelected(n.id);
                  let portfolioImpact = (<span>N/A</span>);
                  let changeToday = (<span>N/A</span>);
                  if(!isNaN(n.relative_portfolio_impact_today)){
                    if(n.relative_portfolio_impact_today > 0) {
                        portfolioImpact = (<span style={{color: 'green'}}>+ {priceFormat(n.relative_portfolio_impact_today, 2, "%", false, true)}</span>);
                    }else if(n.relative_portfolio_impact_today === 0){
                        portfolioImpact = (<span>- {priceFormat(n.relative_portfolio_impact_today, 2, "%", false, true)}</span>);
                    } else {
                        portfolioImpact = (<span style={{color: 'red'}}>- {priceFormat(n.relative_portfolio_impact_today * -1, 2, "%", false, true)}</span>);
                    }
                  }
                  if(!isNaN(n.change_today)) {
                    if(n.change_today > 0) {
                        changeToday = (<span style={{color: 'green'}}>+ {priceFormat(n.change_today, 2, "%", false, true)}</span>);
                    }else if (n.change_today === 0){
                        changeToday = (<span>{priceFormat(n.change_today, 2, "%", false, true)}</span>);
                    } else {
                        changeToday = (<span style={{color: 'red'}}>- {priceFormat(n.change_today * -1, 2, "%", false, true)}</span>);
                    }
                  }
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={-1}
                      key={n.id}
                      selected={isSelected}
                      className={n.symbol === "Total" ? classes.totalRow : null}
                    >
                        <TableCell component="th" scope="row">
                        {
                          n.coingecko_link ? <a href={n.coingecko_link} target="_blank" rel="noopener noreferrer">{n.symbol}</a> : n.symbol
                        }
                        </TableCell>
                        <TableCell align="right">{isNaN(n.token_value_usd) ? n.token_value_usd : priceFormat(n.token_value_usd, 2, "$", true)}</TableCell>
                        <TableCell align="right">{isNaN(n.value_usd) ? n.value_usd : priceFormat(n.value_usd, 2, "$", true)}</TableCell>
                        <TableCell align="right"><a className={n.manual_record_count < 1 || n.symbol === "Total" || isLoading ? "disable-pointer-events medium-opacity" : ""} href="javascript:;" onClick={() => this.launchManualRecordManager(n.coingecko_id)}>{n.manual_record_count}</a></TableCell>
                        <TableCell align="right">{isNaN(n.market_cap) ? n.market_cap : priceFormat(n.market_cap, 2, "$", true)}</TableCell>
                        <TableCell align="right">{isNaN(n.balance) ? n.balance : priceFormat(n.balance, 2, n.symbol, false)}</TableCell>
                        <TableCell align="right">{isNaN(n.portfolio_portion) ? n.portfolio_portion : priceFormat(n.portfolio_portion, 2, "%", false)}</TableCell>
                        <TableCell align="right">{changeToday}</TableCell>
                        <TableCell align="right">{portfolioImpact}</TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
        <OurManageManualRecordsDialog overrideOpen={showManualRecordManager} closeManualRecordManager={this.closeManualRecordManager} tokenId={manualRecordManagerTokenId} isDarkMode={isDarkMode} refetchData={refetchData} publicKey={publicKey} isLoading={isLoading}/>
      </Paper>
    );
  }
}

EnhancedTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EnhancedTable);