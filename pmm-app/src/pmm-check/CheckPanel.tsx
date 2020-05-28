import React, { PureComponent, FC } from 'react';
import { createBrowserHistory } from 'history';
import { PanelProps } from '@grafana/data';
import { Spinner } from '@grafana/ui';
import { Router, Route } from 'react-router-dom';
import { CheckPanelOptions, ActiveCheck, Settings } from './types';
import { CheckService } from './Check.service';
import { COLUMNS } from './CheckPanel.constants';
import { Table } from './components/Table';
import * as styles from './CheckPanel.styles';

export interface CheckPanelProps extends PanelProps<CheckPanelOptions> {}

export interface CheckPanelState {
  dataSource?: ActiveCheck[];
  isLoading: boolean;
  isSttEnabled: boolean;
}

const history = createBrowserHistory();

export class CheckPanel extends PureComponent<CheckPanelProps, CheckPanelState> {
  state = {
    dataSource: undefined,
    isLoading: true,
    isSttEnabled: false,
  };

  constructor(props: CheckPanelProps) {
    super(props);
    this.fetchAlerts = this.fetchAlerts.bind(this);
    this.getSettings = this.getSettings.bind(this);
  }

  componentDidMount() {
    this.getSettings();
  }

  async fetchAlerts() {
    try {
      const dataSource = await CheckService.getActiveAlerts();
      this.setState({ dataSource });
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async getSettings() {
    try {
      const resp = (await CheckService.getSettings()) as Settings;
      this.setState({ isSttEnabled: !!resp.settings?.stt_enabled });
      if (resp.settings?.stt_enabled) {
        this.fetchAlerts();
      } else {
        this.setState({ isLoading: false });
      }
    } catch (err) {
      console.error(err);
      this.setState({ isLoading: false });
    }
  }

  render() {
    const {
      options: { title },
    } = this.props;
    const { dataSource, isSttEnabled, isLoading } = this.state;

    return (
      <div className={styles.panel} data-qa="db-check-panel">
        {isLoading && (
          <div className={styles.spinner}>
            <Spinner />
          </div>
        )}
        {!isLoading && (
          <Table caption={title} data={dataSource} columns={COLUMNS} isSttEnabled={isSttEnabled} />
        )}
      </div>
    );
  }
}

export const CheckPanelRouter: FC<CheckPanelProps> = (props) => (
  <Router history={history}>
    <Route>
      <CheckPanel {...props} />
    </Route>
  </Router>
);
