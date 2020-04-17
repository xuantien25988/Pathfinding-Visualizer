import React from 'react';
import Node from './Node/Node';
import { dijkstra, getNodesInShortestPathOrder } from '../Algorithms/dijkstra';

import './Pathfinding.css';

const MAX_ROW = 20;
const MAX_COL = 50;
const START_NODE_ROW = 10;
const START_NODE_COL = 10;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 40;

export default class Pathfinding extends React.Component {
	constructor() {
		super();
		this.state = {
			startNodeRow       : START_NODE_ROW,
			startNodeCol       : START_NODE_COL,
			finishNodeRow      : FINISH_NODE_ROW,
			finishNodeCol      : FINISH_NODE_COL,
			grid               : [],
			mouseIsPressed     : false,
			changingStartNode  : false,
			changingFinishNode : false
		};
	}

	componentDidMount() {
		this.clearPath();
	}

	clearPath = () => {
		const grid = this.initializeGrid();
		this.setState({
			startNodeRow       : START_NODE_ROW,
			startNodeCol       : START_NODE_COL,
			finishNodeRow      : FINISH_NODE_ROW,
			finishNodeCol      : FINISH_NODE_COL,
			grid,
			mouseIsPressed     : false,
			changingStartNode  : false,
			changingFinishNode : false
		});
	};

	initializeGrid = () => {
		const grid = [];
		for (let row = 0; row < MAX_ROW; row++) {
			const currentRow = [];
			for (let col = 0; col < MAX_COL; col++) {
				currentRow.push(createNode(row, col));
			}
			grid.push(currentRow);
		}
		return grid;
	};

	runDijkstra() {
		const {
			grid,
			startNodeRow,
			startNodeCol,
			finishNodeRow,
			finishNodeCol
		} = this.state;
		const startNode = grid[startNodeRow][startNodeCol];
		const finishNode = grid[finishNodeRow][finishNodeCol];
		const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);

		const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
		this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
	}

	animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
		for (let i = 0; i <= visitedNodesInOrder.length; i++) {
			if (i === visitedNodesInOrder.length) {
				setTimeout(() => {
					this.animateShortestPath(nodesInShortestPathOrder);
				}, 10 * i);
				return;
			}
			setTimeout(() => {
				const node = visitedNodesInOrder[i];
				document.getElementById(`node-${node.row}-${node.col}`).className =
					'node node-visited';
			}, 10 * i);
		}
	}

	animateShortestPath(nodesInShortestPathOrder) {
		for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
			setTimeout(() => {
				const node = nodesInShortestPathOrder[i];
				document.getElementById(`node-${node.row}-${node.col}`).className =
					'node node-shortest-path';
			}, 40 * i);
		}
	}
	//(row !== FINISH_NODE_ROW && col !== FINISH_NODE_COL)
	handleMouseDown(row, col) {
		const { startNodeRow, startNodeCol, finishNodeRow, finishNodeCol } = this.state;

		if (row === startNodeRow && col === startNodeCol) {
			// Is Start Node
			this.setState({ changingStartNode: true });
		} else if (row === finishNodeRow && col === finishNodeCol) {
			// Is Finish Node
			this.setState({ changingFinishNode: true });
		} else {
			// Is Normal Node
			const newGrid = getNewGridWithWall(this.state.grid, row, col);
			this.setState({ grid: newGrid, mouseIsPressed: true });
		}
	}

	handleMouseEnter(row, col) {
		const {
			changingStartNode,
			changingFinishNode,
			startNodeRow,
			startNodeCol,
			finishNodeRow,
			finishNodeCol
		} = this.state;
		if (changingStartNode) {
			const newGrid = getNewGridWithStartNodeChanged(
				this.state.grid,
				row,
				col,
				startNodeRow,
				startNodeCol
			);
			this.setState({
				grid         : newGrid,
				startNodeRow : row,
				startNodeCol : col
			});
		}
		if (changingFinishNode) {
			const newGrid = getNewGridWithFinishNodeChanged(
				this.state.grid,
				row,
				col,
				finishNodeRow,
				finishNodeCol
			);
			this.setState({
				grid          : newGrid,
				finishNodeRow : row,
				finishNodeCol : col
			});
		}
		if (!this.state.mouseIsPressed) return;
		const newGrid = getNewGridWithWall(this.state.grid, row, col);
		this.setState({ grid: newGrid });
	}

	handleMouseUp(row, col) {
		this.setState({
			mouseIsPressed     : false,
			changingStartNode  : false,
			changingFinishNode : false
		});
	}

	render() {
		const { grid, mouseIsPressed } = this.state;
		return (
			<React.Fragment>
				<button onClick={() => this.runDijkstra()}>Visualize Algorithm</button>
				<button onClick={() => this.clearPath()}>Clear</button>
				<div className="grid">
					{grid.map((row, rowIdx) => {
						return (
							<div key={rowIdx}>
								{row.map((node, nodeIdx) => {
									const { row, col, isFinish, isStart, isWall } = node;
									return (
										<Node
											key={nodeIdx}
											row={row}
											col={col}
											isFinish={isFinish}
											isStart={isStart}
											isWall={isWall}
											mouseIsPressed={mouseIsPressed}
											onMouseDown={(row, col) =>
												this.handleMouseDown(row, col)}
											onMouseEnter={(row, col) =>
												this.handleMouseEnter(row, col)}
											onMouseUp={(row, col) =>
												this.handleMouseUp(row, col)}
										/>
									);
								})}
							</div>
						);
					})}
				</div>
			</React.Fragment>
		);
	}
}

const createNode = (row, col) => {
	return {
		row,
		col,
		isStart      : row === START_NODE_ROW && col === START_NODE_COL,
		isFinish     : row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
		isWall       : false,
		distance     : Infinity,
		isVisited    : false,
		previousNode : null
	};
};

const getNewGridWithWall = (grid, row, col) => {
	const newGrid = grid.slice();
	const node = newGrid[row][col];
	const newNode = {
		...node,
		isWall : !node.isWall
	};
	newGrid[row][col] = newNode;
	return newGrid;
};

const getNewGridWithStartNodeChanged = (grid, row, col, startNodeRow, startNodeCol) => {
	const newGrid = grid.slice();

	const oldNode = {
		...newGrid[startNodeRow][startNodeCol],
		isStart : false
	};
	const newNode = {
		...newGrid[row][col],
		isStart : true
	};

	newGrid[startNodeRow][startNodeCol] = oldNode;
	newGrid[row][col] = newNode;

	return newGrid;
};

const getNewGridWithFinishNodeChanged = (
	grid,
	row,
	col,
	finishNodeRow,
	finishNodeCol
) => {
	const newGrid = grid.slice();

	const oldNode = {
		...newGrid[finishNodeRow][finishNodeCol],
		isFinish : false
	};
	const newNode = {
		...newGrid[row][col],
		isFinish : true
	};

	newGrid[finishNodeRow][finishNodeCol] = oldNode;
	newGrid[row][col] = newNode;

	return newGrid;
};
