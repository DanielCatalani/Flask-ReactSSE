from datetime import datetime
from flask import Flask
from flask_cors import CORS
from flask_sse import sse
from apscheduler.schedulers.background import BackgroundScheduler

# Configurations
config = dict(
		server_frequency = 1,
		server_address = '0.0.0.0',
		server_port = 5000,
		server_name = 'Server X',
		reddis_address= 'redis://localhost',
		sse_url= '/stream'
	)

app = Flask(config['server_name'])

# Make app cross origin compatible
CORS(app)

# configure redis address
app.config["REDIS_URL"] = config['reddis_address']
""" configure sse url """
app.register_blueprint(sse, url_prefix=config['sse_url'])

"""
:param param: string
:return: string
"""
@app.route('/send')
def event_source() -> str:
    with app.app_context():
        now = datetime.now()
        sse.publish({
        		'time': {
        			'second': now.strftime('%S'),
        			'minute': now.strftime('%M'),
        			'hour': now.strftime('%I'),
        			'time': now.strftime('%p')
        		},
        		'server': {
        			'frequency': config['server_frequency'],
        			'name': config['server_name']
        		}

        	}, type='message')

# Set app scheduler and repeat push for (N) seconds
sched = BackgroundScheduler(daemon=True)
sched.add_job(event_source, 'interval', seconds=config['server_frequency'])
sched.start()

if __name__ == '__main__':
   app.config['DEBUG'] = True
   app.run(debug=True,host=config['server_address'], port=config['server_port'])