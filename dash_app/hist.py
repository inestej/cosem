from dash import dcc, html
import dash
import pandas as pd

def histogram():
    import plotly.express as px
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

app = dash.Dash(__name__)
app.layout = html.Div([
    dcc.Graph(id='hist', figure=histogram())
])

if __name__ == '__main__':
    app.run_server(debug=True)
