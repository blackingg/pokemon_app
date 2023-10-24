import React, { useEffect, useState } from "react";
import "./index.css";
import { typeColors } from "./setup";

function App() {
	const [currentList, setCurrentList] = useState([]);
	const [currentlyShowingAmount, setCurrentlyShowingAmount] = useState(0);
	const [maxIndex, setMaxIndex] = useState(29);

	// Function for fetching data and updating the state
	async function fetchData() {
		try {
			// Fetch data from the Pokemon API
			const response = await fetch(
				"https://pokeapi.co/api/v2/pokemon/?limit=898"
			);
			const data = await response.json();

			const pokemonList = data.results.map((pokemon, index) => ({
				id: index + 1,
				name: pokemon.name,
				types: [],
			}));

			for (let i = 0; i < 18; i++) {
				const typeResponse = await fetch(
					`https://pokeapi.co/api/v2/type/${i + 1}`
				);
				const typeData = await typeResponse.json();

				const pokemonInType = typeData.pokemon;

				for (let j = 0; j < pokemonInType.length; j++) {
					const pokemonId = pokemonInType[j].pokemon.url
						.split("/")
						.slice(-2)[0];
					if (pokemonId <= pokemonList.length) {
						pokemonList[pokemonId - 1].types.push(typeData.name);
					}
				}
			}

			setCurrentList(pokemonList);
			console.log(pokemonList);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	}

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		function handleScroll() {
			if (
				window.innerHeight + window.scrollY >=
					document.body.offsetHeight - 100 &&
				currentlyShowingAmount < currentList.length
			) {
				// Increase maxIndex when near the bottom and more items are available
				setMaxIndex((prevMaxIndex) => prevMaxIndex + 10);
			}
		}

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [currentList, currentlyShowingAmount]);

	const openInfo = (id) => {
		// Define openInfo function logic here
	};

	return (
		<div className="bg-gray-100 min-h-screen flex flex-col justify-center items-center overflow-x-hidden">
			<div className=" p-8 w-9/12 max-w-screen-xl">
				<h1 className="text-2xl text-center text-blue-800">Pokemon List</h1>
				<div className="flex flex-wrap">
					{currentList.slice(0, maxIndex).map((pokemon) => (
						<div
							key={pokemon.id}
							className="flex flex-col justify-center items-center min-w-[20%] rounded-lg m-10 mt-60 pt-20 p-5 relative cursor-pointer border-2  hover:border-gray-300 shadow-md "
							onClick={() => openInfo(pokemon.id)}
						>
							<img
								className="absolute top-[-55px] pixelated transition duration-100  hover:scale-125"
								src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
								alt={pokemon.name}
							/>
							<span className="text-base text-gray-300 font-semibold">
								N°{pokemon.id}
							</span>
							<h2 className="text-base  font-semibold mt-2">{pokemon.name}</h2>
							<div className="flex space-x-2">
								{pokemon.types.map((type, typeIndex) => (
									<div
										key={typeIndex}
										className={`px-3 py-1 text-white rounded-md`}
										style={{ background: typeColors[type] }}
									>
										{type}
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default App;
