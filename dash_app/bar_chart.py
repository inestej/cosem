from dash import dcc, html
import dash
import pandas as pd


def bar_chart():
    import plotly.graph_objects as go
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

app = dash.Dash(__name__)
app.layout = html.Div([
    dcc.Graph(id='bar', figure=bar_chart())
])

if __name__ == '__main__':
    app.run_server(debug=True)
