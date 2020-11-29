import React from 'react';
import './Assets/App.css';

class App extends React.Component {
    /**
    * function description
    *
    */
    constructor(props){
      super(props);

      // bind this context
      this.changeServer = this.updateServer.bind(this);
      this.eventSourceCtl = this.eventSourceCtl.bind(this);

      // Set state
      this.state = {
        data: {
            time : {second:'00', minute:'00', hour: '00', time: 'AM'}
        },
        server: {
            connected: false,
            frequency: 0,
            address: "http://localhost:5000/event",
            state:"disconnected",
            name: "Null"
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
                connected: (property == "connected")? value:this.state.server.connected,
                frequency: (property == "frequency")? value:this.state.server.frequency,
                address: (property == "address")? value:this.state.server.address,
                state: (property == "state")? value:this.state.server.state,
                name: (property == "name")? value:this.state.server.name
            }
        });
    };

    /**
    * Handles EventSource operation
    * 
    */
    eventSourceCtl(connect=true) {
        
        if (this.state.server.connected || (!connect)) {
           // close EventSource
           this.updateServer('state', 'disconnected');
           this.updateServer('connected', false);
           this.stream.close();
           return;
        }

        // create EventSource
        this.stream = new EventSource(this.state.server.address);

        this.updateServer('state', 'connecting');

        // On error, log event and set server status to disconnected
        this.stream.onerror = e => {
            this.eventSourceCtl(false);
            this.logEvent('error', `Error occured while connecting to <a>${e.target.url}</a>`);
        }
         
        // On open, log event and set server status to connected
        this.stream.onopen = e => {
            this.updateServer('state', 'connected');
            this.updateServer('connected', true);

            this.logEvent('success', 'connected');
        }

        // On message, get data and set connection details
        this.stream.onmessage = e => {
            let data = JSON.parse(e.data);

            if (data.time) this.setState({data:{time: data.time}});
            if (data.server) this.setState({server: data.server});

            this.logEvent('success', `Data received: <Json>data</Json>`);

            //console.log("Data:", data, "Received at:", new Date())
        }

        // On close, log event and set server status to connected
        this.stream.onclose = e => {
            this.eventSourceCtl(false);
            this.logEvent('error', `Connection closed from <a>${e.target.url}</a>`);
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
                <time>${(new Date())}</time>
            </div>
        `

        console.innerHTML = log+console.innerHTML
    }

    /**
    * on component mount 
    * 
    */
    componentDidMount() {
        this.eventSourceCtl();
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
                <div className="server-address-field-wrapper mb12">
                    <input className="server-address-field" type="text" placeholder="Server Address" onChange={e => this.updateServer('address', e.target.value)}/>
                </div>
                
                <div className="server-conn-details-wrapper">
                    <ul className="server-conn-details">
                        <li>
                            <div className="--icon"></div>
                            <div className="--details">
                                <strong contentEditable='true'>{this.state.server.address}</strong>
                                <span>Server Address</span>
                            </div>
                        </li>
                        
                        <li>
                            <div className="--icon"></div>
                            <div className="--details">
                                <strong>{this.state.server.name}</strong>
                                <span>Server Name</span>
                            </div>
                        </li>
                        <li>
                            <div className="--icon"></div>
                            <div className="--details">
                                <strong>{this.state.server.frequency} seconds(s)</strong>
                                <span>Event Frequency</span>
                            </div>
                        </li>

                        <li>
                            <div className="--icon"></div>
                            <div className="--details">
                                <strong style={{color: this.state.server.state == 'disconnected'? "var(--red)":"var(--green)", textTransform:'capitalize'}}
                                >
                                    {this.state.server.state}
                                </strong>
                                <span>Connection Status</span>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="server-ctl-btn-wrapper">
                    <button className={'server-ctl-btn'} style={{backgroundColors: this.state.server.connected && "var(--red)"}} onClick={this.eventSourceCtl}>
                        <div>{this.state.server.connected ? 'Disconnect' : 'Connect'}</div>
                    </button>
                </div>
            </section>

            <section className="section-server-updates">
                <header className="section-server-update-hd pd15">
                    <strong>Data</strong>
                </header>
                <main id="server_updates">
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
