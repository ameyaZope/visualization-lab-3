import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React from "react";
import MDSDataPlot from "./MDSDataPlot";
import MDSVariablesPlot from "./MDSVariablesPlot";

function MDSPlotCombined({ numClusters, handleNumClusterChange, chosenDimensions, handleChosenDimensionsChange }) {
	const [currPlot, setCurrPlot] = React.useState('mds_data_plot');

	const handleCurrPlotChange = (event) => {
		setCurrPlot(event.target.value)
	}

	return (
		<div>
			<FormControl>
				<RadioGroup
					row
					aria-labelledby="demo-radio-buttons-group-label"
					value={currPlot}
					name="radio-buttons-group"
					onChange={handleCurrPlotChange}
				>
					<FormControlLabel value="mds_data_plot" control={<Radio />} label="Data Plot" />
					<FormControlLabel value="mds_variables_plot" control={<Radio />} label="Variables Plot" />
				</RadioGroup>
			</FormControl>
			{currPlot == 'mds_data_plot' ? <MDSDataPlot numClusters={numClusters} handleNumClusterChange={handleNumClusterChange} /> : <MDSVariablesPlot chosenDimensions={chosenDimensions} handleChosenDimensionsChange={handleChosenDimensionsChange} />}
		</div>
	)
}

export default MDSPlotCombined;