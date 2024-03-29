import { Container, Grid } from "@mui/material";
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
					<Grid item xs={4.5} style={{ height: '46vh', width: '30vw' }}> {/* Adjust height and width as needed */}
						<KMeansBarChart numClusters={numClusters} handleNumClusterChange={handleNumClusterChange} />
					</Grid>
					<Grid item xs={6} style={{ height: '46vh', width: '60vw' }}> {/* Adjust height and width as needed */}
						<MDSPlotCombined numClusters={numClusters} chosenDimensions={chosenDimensions} handleChosenDimensionsChange={handleChosenDimensionsChange} />
					</Grid>
					<Grid item xs={12} style={{ height: '50vh', width: '100vw' }}> {/* Adjust height and width as needed */}
						<ParallelCoordinatePlot numClusters={numClusters} chosenDimensions={chosenDimensions} />
					</Grid>
				</Grid>
			</Container>
		</>
	);
};

export default HomePage;