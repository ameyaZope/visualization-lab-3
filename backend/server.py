import json
from flask import Flask
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.manifold import MDS

np.random.seed()

app = Flask(__name__)
app.config.from_pyfile("settings.py")

data = pd.read_csv('../data/spotify_processed_data.csv')
numeric_column_list = ['instrumentalness_percent', 'acousticness_percent', 'danceability_percent', 'valence_percent',
                       'energy_percent', 'liveness_percent', 'speechiness_percent']
all_columns_list = ['id',
                    'bpm_categorical', 'key', 'mode', 'released_day', 'released_month', 'released_year_categorical',
                    'in_apple_playlists_categorical', 'in_spotify_playlists_categorical',
                    'danceability_percent', 'valence_percent',
                    'energy_percent', 'acousticness_percent', 'instrumentalness_percent',
                    'liveness_percent', 'speechiness_percent']

numerical_data = data[numeric_column_list]
# Pre Process numerical_data
ss = StandardScaler()
numerical_data = ss.fit_transform(numerical_data)
numerical_data_pd = pd.DataFrame(numerical_data, columns=numeric_column_list)
numerical_data_pd.head()

# Applying PCA on numerical data
pca = PCA().fit(numerical_data)
pca_components = pca.transform(numerical_data)

n_components = 2
mds = MDS(n_components=n_components)
# this is scaled numerical data as input
mds_transform_data = mds.fit_transform(numerical_data)

df_kmeans = pd.DataFrame()
df_kmeans.insert(loc=0, column=f'Data Point', value=[
                 x for x in range(0, len(numerical_data))])
kmeans_data = []
for k in range(1, 11, 1):
    kmeans = KMeans(n_clusters=k, random_state=66).fit(numerical_data)
    km_pred = kmeans.predict(numerical_data)
    df_kmeans.insert(loc=len(df_kmeans.columns),
                     column=f'{k}_clusters', value=km_pred)
    kmeans_data.append(
        {'k': k, 'kmeans_intertia': kmeans.inertia_, 'km_pred': km_pred.tolist()})

mds_data = []
for k in range(1, 11, 1):
    display_data = []
    for i, val in enumerate(kmeans_data[k-1]['km_pred']):
        display_data.append(
            [mds_transform_data[i][0], mds_transform_data[i][1], kmeans_data[k-1]['km_pred'][i]])
    mds_data.append({
        "k": k,
        "display_data":  display_data
    })

distance_matrix = 1 - np.abs(numerical_data_pd.corr())
mds_variables = MDS(n_components=n_components, metric=True,
                    dissimilarity='precomputed', random_state=None)
mds_variables_transform_coords = mds_variables.fit_transform(distance_matrix)
mds_variables_data = mds_variables_transform_coords.tolist()

pcp_data = []
print(data[all_columns_list].values.tolist())
for k in range(1, 11, 1):
    display_data = []
    for i, val in enumerate(kmeans_data[k-1]['km_pred']):
        temp_data = data[all_columns_list].values[i].tolist()
        display_data.append({
            'id': temp_data[0],
            'bpm_categorical' : temp_data[1], 
            'key' : temp_data[2],
            'mode' : temp_data[3],
            'released_day' : temp_data[4],
            'released_month' : temp_data[5], 
            'released_year_categorical':  temp_data[6],
            'in_apple_playlists_categorical' : temp_data[7],
            'in_spotify_playlists_categorical' : temp_data[8],
            'danceability_percent' : temp_data[9], 
            'valence_percent' : temp_data[10],
            'energy_percent' : temp_data[11],
            'acousticness_percent' : temp_data[12],
            'instrumentalness_percent' : temp_data[13],
            'liveness_percent' : temp_data[14], 
            'speechiness_percent' : temp_data[15],
            'cluster': kmeans_data[k-1]['km_pred'][i]
        })
    pcp_data.append({
        "k": k,
        "display_data":  display_data
    })

biplot_display_data = []
for i in range(0, len(pca_components), 1):
    kmd = []
    for j in range(0, len(kmeans_data), 1):
        kmd.append(kmeans_data[j]['km_pred'][i])
    biplot_display_data.append({
        'pcs': pca_components[i].tolist(),
        'clusters': kmd
    })


@app.route("/apis/pca/kMeansData", methods=['GET'])
def get_pca_k_means_data():
    return {
        'data': kmeans_data
    }


@app.route("/apis/mds/dataPlot", methods=['GET'])
def get_mds_data_plot():
    return {
        'mds_data': mds_data
    }


@app.route("/apis/mds/variablesPlot", methods=['GET'])
def get_mds_variables_plot():
    return {
        'mds_variables_data': mds_variables_data
    }


@app.route("/apis/parallelCoordinatePlot/data", methods=['GET'])
def get_parallel_coordinate_plot_data():
    return {
        'pcp_data': pcp_data
    }


if __name__ == '__main__':
    # Make the server publicly available
    app.run(host='0.0.0.0', port=8080, debug=True)
