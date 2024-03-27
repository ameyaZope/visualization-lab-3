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
print(mds_variables_transform_coords)

mds_variables_data = mds_variables_transform_coords.tolist()
print(mds_variables_data)

df_kmeans.to_csv('kmeans_points_vs_clusters.csv', index=False)

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


if __name__ == '__main__':
    # Make the server publicly available
    app.run(host='0.0.0.0', port=8080, debug=True)
