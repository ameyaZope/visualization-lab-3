import { Container, Grid, Paper } from "@mui/material";
import * as React from 'react';
import KMeansBarChart from "../components/KMeansBarChart";
import MDSPlotCombined from "../components/MDSPlotsCombined";
import ParallelCoordinatePlot from "../components/ParallelCoordinatePlot";

function HomePage() {
	const [numClusters, setNumClusters] = React.useState(3);
	const handleNumClusterChange = (numClusters) => {
		console.log(`Changing clusters to ${numClusters}`)
		setNumClusters(numClusters)
	}

	const [chosenDimensions, setChosenDimensions] = React.useState([]);
	const handleChosenDimensionsChange = (newChosenDimensions) => {
		console.log(`New Chosen Dimension is ${newChosenDimensions}`)
		setChosenDimensions(newChosenDimensions);
	}

	return (
		<>
			<Container>
				<Grid container spacing={2}>
					<Grid item xs={4.5} style={{ height: '300px', width: '400px', marginTop: '20px' }}> {/* Adjust height and width as needed */}
						<Paper elevation={3} >
						<KMeansBarChart numClusters={numClusters} handleNumClusterChange={handleNumClusterChange} />
						</Paper>
					</Grid>
					<Grid item xs={6} style={{ height: '300px', width: '500px', marginTop: '20px', }}> {/* Adjust height and width as needed */}
						<Paper elevation={3} style={{ height: '300px', width: '500px' }}>
						<MDSPlotCombined numClusters={numClusters} chosenDimensions={chosenDimensions} handleChosenDimensionsChange={handleChosenDimensionsChange} />
						</Paper>
					</Grid>
					<Grid item xs={12} style={{ height: '300px', width: '950px', marginTop: '20px' }}> {/* Adjust height and width as needed */}
						<Paper elevation={3} style={{ height: '300px', width: '950px' }}>
						<ParallelCoordinatePlot numClusters={numClusters} chosenDimensions={chosenDimensions} />
						</Paper>

					</Grid>
				</Grid>
			</Container>
		</>
	);
};

export default HomePage;