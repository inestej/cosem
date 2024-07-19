import os
from flask import Flask, render_template, url_for, redirect, flash, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, login_user, LoginManager, login_required, logout_user, current_user
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, TextAreaField
from wtforms.validators import InputRequired, Length, ValidationError, EqualTo, Email
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
import psycopg2
from urllib.parse import urlparse
import requests
import matplotlib.pyplot as plt
import geopandas as gpd
import random
import numpy as np
import plotly.express as px
import dash
from dash import dcc, html
import pandas as pd
import plotly.graph_objects as go

app = Flask(__name__, template_folder="templates")
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'thisisasecretkey')
bcrypt = Bcrypt(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://default:3zdkqlyXc9ZB@ep-spring-thunder-a44g23e4.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(80), nullable=False)

# Function to create the user table if it doesn't exist
def create_user_table():
    db_uri = os.getenv('DATABASE_URL', 'postgresql://default:3zdkqlyXc9ZB@ep-spring-thunder-a44g23e4.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require')
    result = urlparse(db_uri)
    username = result.username
    password = result.password
    database = result.path[1:]
    hostname = result.hostname
    port = result.port

    conn = psycopg2.connect(database=database,
                            host=hostname,
                            user=username,
                            password=password,
                            port=port)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS "user" (
        id SERIAL PRIMARY KEY,
        username VARCHAR(80) UNIQUE NOT NULL,
        email VARCHAR(120) UNIQUE NOT NULL,
        password VARCHAR(120) NOT NULL
    )
    """)
    conn.commit()
    cursor.close()
    conn.close()

# Create the user table before starting the app
create_user_table()

class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __init__(self, name, email, subject, message):
        self.name = name
        self.email = email
        self.subject = subject
        self.message = message

def create_contact_message_table():
    db_uri = os.getenv('DATABASE_URL', 'postgresql://default:3zdkqlyXc9ZB@ep-spring-thunder-a44g23e4.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require')
    result = urlparse(db_uri)
    username = result.username
    password = result.password
    database = result.path[1:]
    hostname = result.hostname
    port = result.port

    conn = psycopg2.connect(database=database,
                            host=hostname,
                            user=username,
                            password=password,
                            port=port)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS "contact_message" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    cursor.close()
    conn.close()

# Create the contact_message table before starting the app
create_contact_message_table()

class RegisterForm(FlaskForm):
    username = StringField(validators=[InputRequired(message="Username is required"), Length(min=3, max=20)], render_kw={"placeholder": "Username"})
    email = StringField('Email', validators=[
                                    InputRequired(message="Email is required"),
                                    Email(message="Enter a valid email address")
                                            ],
                        render_kw={"placeholder": "Email"})
    password = PasswordField(validators=[InputRequired(message="Password is required"), Length(min=8, max=20)], render_kw={"placeholder": "Password"})
    confirm_password = PasswordField('Confirm Password', validators=[InputRequired(), EqualTo('password', message='Passwords must match')], render_kw={"placeholder": "Confirm Password"})
    submit = SubmitField('Register')

    def validate_username(self, username):
        existing_user_username = User.query.filter_by(username=username.data).first()
        if existing_user_username:
            raise ValidationError('That username already exists. Please choose a different one.')

    def validate_email(self, email):
        existing_user_email = User.query.filter_by(email=email.data).first()
        if existing_user_email:
            raise ValidationError('That email already exists. Please choose a different one.')

class LoginForm(FlaskForm):
    username = StringField(validators=[InputRequired(), Length(min=3, max=20)], render_kw={"placeholder": "Username"})
    password = PasswordField(validators=[InputRequired(), Length(min=8, max=20)], render_kw={"placeholder": "Password"})
    submit = SubmitField('Login')

class ContactForm(FlaskForm):
    name = StringField('Name', validators=[InputRequired(), Length(min=2, max=50)])
    email = StringField('Email', validators=[InputRequired(), Email()])
    subject = TextAreaField('Subject', validators=[InputRequired(), Length(min=1)])
    message = TextAreaField('Message', validators=[InputRequired(), Length(min=1)])
    submit = SubmitField('Submit')
    
class Polygon(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    coordinates = db.Column(db.Text, nullable=False)

    def __init__(self, coordinates):
        self.coordinates = coordinates

def create_polygon_table():
    db_uri = os.getenv('DATABASE_URL', 'postgresql://default:3zdkqlyXc9ZB@ep-spring-thunder-a44g23e4.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require')
    result = urlparse(db_uri)
    username = result.username
    password = result.password
    database = result.path[1:]
    hostname = result.hostname
    port = result.port

    conn = psycopg2.connect(database=database,
                            host=hostname,
                            user=username,
                            password=password,
                            port=port)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS "polygon" (
        id SERIAL PRIMARY KEY,
        coordinates TEXT NOT NULL
    )
    """)
    conn.commit()
    cursor.close()
    conn.close()

# Create the polygon table before starting the app
create_polygon_table()

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        name = form.name.data
        email = form.email.data
        subject = form.subject.data
        message = form.message.data

        # Create a new contact message
        new_message = ContactMessage(name=name, email=email, subject=subject, message=message)
        db.session.add(new_message)
        db.session.commit()

        flash('Thank you for submitting your message!')
        return redirect(url_for('thnx_for_submit'))
    return render_template('contact.html', form=form)

@app.route('/thnx')
def thnx_for_submit():
    return render_template('thnx_for_submit.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    error = None
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user, remember=True)
            return redirect(url_for('private_dashboard'))
        else:
            error = 'Invalid username or password. Please try again.'
    return render_template('login.html', form=form, error=error)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        new_user = User(username=form.username.data, email=form.email.data, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        flash('Registration Successful! Please log in.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', form=form)

# Function to fetch GeoJSON data
def fetch_geojson_data():
    url = 'http://catalog.industrie.gov.tn/dataset/9910662a-4594-453f-a710-b2f339e0d637/resource/1b7e3eba-b178-4902-83db-ef46f26e98a0/download/delegations.geojson'
    response = requests.get(url)
    data = response.json()
    return gpd.GeoDataFrame.from_features(data)

def Creation_map():
    # Filter by governorates
    governorates = ['Manubah', 'Bizerte', 'Zaghouan', 'Siliana', 'Ben Arous', 'Béja', 'Jendouba', 'Le Kef', 'Ariana']
    ext = fetch_geojson_data()[fetch_geojson_data()['gov_name_f'].isin(governorates)]

    # Generate random values
    random.seed(42)
    cereale_codes = [random.randint(1, 4) for _ in range(len(ext))]
    variete_codes = [random.randint(1, 12) for _ in range(len(ext))]
    superficies = [random.randint(10, 100) for _ in range(len(ext))]
    productions = [random.randint(20, 5000) for _ in range(len(ext))]

    # Add new columns
    ext.loc[:, 'code_cereale'] = cereale_codes
    ext.loc[:, 'code_variete'] = variete_codes
    ext.loc[:, 'superficie'] = superficies
    ext.loc[:, 'production'] = productions

    # Map code to text
    def map_code_to_text(code):
        if code == 1:
            return 'BD'
        elif code == 2:
            return 'BT'
        elif code == 3:
            return 'Tr'
        elif code == 4:
            return 'Or'
        else:
            return 'Unknown'

    ext.loc[:, 'cereale_text'] = ext['code_cereale'].apply(map_code_to_text)
    # Convert GeoDataFrame to GeoJSON
    geojson = ext.__geo_interface__

    # Create the choropleth map with Plotly
    fig = px.choropleth(
        ext,
        geojson=geojson,
        locations=ext.index,
        color='production',
        color_continuous_scale='YlGn',
        hover_data={'cereale_text': True, 'production': True },
        labels={'production': 'Production', 'cereale_text': 'Cereale Type'},
        hover_name='gov_name_f', 
        title='Map of Production by Governorate - Simulated Data',
        height=895
    )

    fig.update_geos(fitbounds="locations", visible=False)
    fig.update_layout(
        mapbox_style="carto-positron",
        mapbox_zoom=7,
        mapbox_center={"lat": 34.0, "lon": 9.0},
        margin={"r":0,"t":60,"l":0,"b":0},
        coloraxis_colorbar={
            'title': 'Production',
            'tickvals': [min(productions), max(productions)],
            'ticktext': [min(productions), max(productions)],
            'x': 1.05,  # Positioning the color bar
            'xanchor': 'left',
            'y': 0.5,
            'yanchor': 'middle'
        }
    )

    return fig

def histogram():
    # Read the CSV file
    cereal_data = pd.read_csv('cereal_data.csv')
    
    # Group the data by governorate and sum the cereal quantities
    governorate_data = cereal_data.groupby('gov_name_f_y')[['BD', 'BT', 'Tr', 'Or']].sum().reset_index()

    # Melt the DataFrame to long format for easier plotting
    governorate_data_melted = pd.melt(governorate_data, id_vars='gov_name_f_y', var_name='Cereal', value_name='Quantity')

    # Create the bar plot using Plotly
    fig = px.bar(governorate_data_melted, 
                x='gov_name_f_y', 
                y='Quantity', 
                color='Cereal', 
                title='Cereal Production by Governorate - simulated data',
                labels={'gov_name_f_y': 'Governorate', 'Quantity': 'Total Quantity'},
                barmode='group')

    # Update layout for better readability
    fig.update_layout(xaxis_tickangle=-45, xaxis_title='Governorate', yaxis_title='Total Quantity')
    
    return fig
def bar_chart():
    cereal_data = pd.read_csv('cereal_data.csv')
    # Group the data by governorate and sum the relevant columns
    governorate_data = cereal_data.groupby('gov_name_f_y')[['superficie', 'BD', 'BT', 'Tr', 'Or']].sum().reset_index()

    # Define the colors for the cereals
    colors = ['#440154', '#3b528b', '#21908d', '#5dc863']  # Example colors from Viridis

    # Create the Plotly figure
    fig = go.Figure()

    # Add traces for each cereal
    cereals = ['BD', 'BT', 'Tr', 'Or']
    for i, cereal in enumerate(cereals):
        fig.add_trace(go.Bar(
            x=governorate_data['gov_name_f_y'],
            y=governorate_data[cereal],
            name=cereal,
            marker_color=colors[i]
        ))

    # Update layout for better readability
    fig.update_layout(
        title='Cereal Production as Proportion of Area by Governorate - simulated data',
        xaxis_title='Governorate',
        yaxis_title='Superficie',
        barmode='stack',
        xaxis_tickangle=-45,
        showlegend=True,
        plot_bgcolor='white'  # Change the background color to white
    )
    
    return fig
    
# Create a Dash application
map = dash.Dash(__name__, server=app, url_base_pathname='/tunisia_map/')
hist = dash.Dash(__name__, server=app, url_base_pathname='/hist/')
BarChart = dash.Dash(__name__, server=app, url_base_pathname='/bar_chart/')

# Define the layout of the map
map.layout = html.Div([
    dcc.Graph(id='map', figure=Creation_map())
])

# Define the layout of the histograme
hist.layout = html.Div([
    dcc.Graph(id='hist', figure=histogram())
])

# Define the layout of the bar chart
BarChart.layout = html.Div([
    dcc.Graph(id='bar', figure=bar_chart())
])    

@app.route('/private_dashboard')
@login_required
def private_dashboard():
    return render_template('private_dashboard.html')

@app.route('/public_dashboard')
def public_dashboard():
    dash_urls = ['/tunisia_map/', '/hist/','/bar_chart/']
    return render_template('public_dashboard.html', dash_urls=dash_urls)

@app.route('/save_polygon', methods=['POST'])
def save_polygon():
    data = request.json
    coordinates = data.get('coordinates')

    if coordinates:
        # Save the coordinates to the database
        polygon = Polygon(coordinates=str(coordinates))
        db.session.add(polygon)
        db.session.commit()

        return jsonify({'status': 'success', 'coordinates': coordinates})
    else:
        return jsonify({'status': 'error', 'message': 'No coordinates provided'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
