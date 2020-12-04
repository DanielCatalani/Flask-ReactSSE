import React from 'react';
import './Assets/style/App.css';


class App extends React.Component {
    /**
    * function description
    *
    */
    constructor(props){
      super(props);

      // set context
      this.eventSourceCtl = this.eventSourceCtl.bind(this);
      this.updateServer = this.updateServer.bind(this);

      // Set state
      this.state = {
        data: {
            time : {second:'00', minute:'00', hour: '00', time: 'AM'}
        },
        server: {
            connected: false,
            frequency: 0,
            address: "http://localhost:5000/stream",
            state:"disconnected",
            name: ''
        }
      };
    }

    /**
    * Updates server configs
    *
    * @param {string} property   property to update
    * @param {string} value      property value
    */
    updateServer(property, value) {
        if (property == 'address') this.eventSourceCtl(false);
        // description
        this.setState({server: {
                connected: (property == "connected")? value : this.state.server.connected,
                frequency: (property == "frequency")? value : this.state.server.frequency,
                address: (property == "address")? value : this.state.server.address,
                state: (property == "state")? value : this.state.server.state,
                name: (property == "name")? value : this.state.server.name
            }
        });
    };

    /**
    * Handles EventSource operation
    * 
    */
    eventSourceCtl(connect=true) {
        // Close connection
        if (this.state.server.connected || (!connect)) {
           this.setState({server: {
                    connected: false,
                    frequency: 0,
                    address: this.state.server.address,
                    state: 'disconnected',
                    name: ''
                }
            });

           this.stream.close();
           
           return true;
        }

        // create EventSource
        this.stream = new EventSource(this.state.server.address);

        this.updateServer('state', 'connecting');

        // On error, log event and set server status to disconnected
        this.stream.onerror = e => {
            this.eventSourceCtl(false);

            if (e.readyState == EventSource.CLOSED) {
                this.logEvent('error', `Connection closed from <a>${e.target.url}</a>`);
            
            } else {
                this.logEvent('error', `Error occured while connecting to <a>${e.target.url}</a>`);
            }
        }
         
        // On open, log event and set server status to connected
        this.stream.onopen = e => {
            this.updateServer('state', 'connected');
            this.updateServer('connected', true);
            this.logEvent('success', `Connection estabilished with <a>${e.target.url}</a>`);
        }

        // On message, get data and set connection details
        this.stream.onmessage = e => {
            let data = JSON.parse(e.data);

            if (data.time) this.setState({data:{time: data.time}});

            if (data.server) {
                this.updateServer('frequency', data.server.frequency);
                this.updateServer('name', data.server.name);
            }

            this.logEvent('success', `Data received: <pre><code>${e.data}</code></pre>`);

            console.log("Data:", data, "Received at:", new Date())
        }
    }

    /**
    * Log events to ui console
    * 
    * @param {type}  type of value [error, success]
    * @param {data}  message to log
    */

    logEvent(type, data) {
        const console = document.querySelector('#console_logs .--logs')

        const log = `
            <div class="pd15 mb12 --log ${type}">
                <strong class="status">${type}</strong>
                <div class="data">${data}</div>
                <time>${(new Date()).toLocaleString()}</time>
            </div>
        `

        console.innerHTML = log+console.innerHTML
    }

    /**
    * on component mount 
    * 
    */
    componentDidMount() {
        //this.eventSourceCtl();
    };

    /**
    * Renders template
    *
    * @return {JSX} 
    */
    render() {
        return (
      	<div className="container sections">
            <section className="section-connection-panel pd15">
                <div className="server-conn-details-wrapper">
                    <ul className="server-conn-details">
                        <li>
                            <div className="--icon"></div>
                            <div className="--details">
                                {/* comment */}
                                <strong>{this.state.server.address}</strong>
                                <span>Server Address</span>
                            </div>
                        </li>
                        
                        <li>
                            <div className="--icon"></div>
                            <div className="--details">
                                {/* comment */}
                                {this.state.server.name != "" 
                                    ? <strong>{this.state.server.name}</strong>
                                    : <div className="empty l1"></div>
                                }
                                <span>Server Name</span>
                            </div>
                        </li>
                        <li>
                            <div className="--icon"></div>
                            <div className="--details">
                                {/* comment */}
                                {this.state.server.frequency 
                                    ? <strong>{this.state.server.frequency} seconds(s)</strong>
                                    : <div className="empty"></div>
                                }
                                <span>Event Frequency</span>
                            </div>
                        </li>

                        <li>
                            <div className="--icon"></div>
                            <div className="--details">
                                {/* comment */}
                                <strong style={{color: this.state.server.state == 'disconnected'? "var(--red)":"var(--green)", textTransform:'capitalize'}}
                                >
                                    {this.state.server.state}
                                </strong>
                                <span>Connection Status</span>
                            </div>
                        </li>
                    </ul>
                </div>
                {/* comment */}
                <div className="server-ctl-btn-wrapper">
                    <button disabled={this.state.server.state == 'connecting'} className={'server-ctl-btn'} style={{backgroundColor: this.state.server.connected && "var(--red)"}} onClick={this.eventSourceCtl}>
                        <div className="text">{this.state.server.connected ? 'Disconnect' : 'Connect'}</div>
                        <div className="connecting"></div>
                    </button>
                </div>
            </section>

            <section className="section-server-updates">
                <header className="section-server-update-hd pd15">
                    {this.state.server.connected && <div className="connected"></div>}
                    <strong>Data</strong>
                </header>
                <main id="server_updates">
                    {/* comment */}
                    <div id="time_update" className="pd15 mb12">
                        <strong className="time-update-title">Time</strong>
                        <div className="time-update-wrapper">
                            <time id="time_hour">{this.state.data.time.hour}</time>:
                            <time id="time_minute">{this.state.data.time.minute}</time>:
                            <time id="time_seconds">{this.state.data.time.second}</time>
                            <time id="time_hour">{this.state.data.time.time}</time>
                        </div>
                    </div>
                </main>
            </section>

            <section className="section-console-logs">
                <main id="console_logs" className="pd15">
                    {/* comment */}
                    <div className="--logs"></div>
                </main>
                <footer className="section-console-logs-ft">
                    <strong>Console</strong>
                </footer>
            </section>
        </div>
        );
    }
}

export default App;
