import React, { useEffect, useState } from "react";
import "./index.css";

function App() {
	const [currentList, setCurrentList] = useState([]);
	const [currentlyShowingAmount, setCurrentlyShowingAmount] = useState(0);
	const [maxIndex, setMaxIndex] = useState(29);

	useEffect(() => {
		async function fetchData() {
			try {
				// Fetch data from the Pokemon API
				const response = await fetch(
					"https://pokeapi.co/api/v2/pokemon/?limit=898"
				);
				const data = await response.json();

				const pokemonList = data.results.map((pokemon, index) => {
					return {
						id: index + 1,
						name: pokemon.name,
						types: [],
					};
				});

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

	return (
		<div className="bg-gray-100 min-h-screen flex justify-center items-center overflow-x-hidden">
			<div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-screen-xl">
				<h1 className="text-2xl text-center text-blue-800">Pokemon List</h1>
				<div className="flex flex-wrap">
					{currentList.map((_, index) => (
						<div
							className="flex-1 w-1/5 md:w-1/5 lg:w-1/5 m-2 mt-16 pt-10 relative cursor-pointer border-2 border-white transition-transform transform duration-100 hover:scale-105"
							onClick={() => openInfo(currentList[index].id)}
						>
							<img
								className=""
								src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentList[index].id}.png`}
							/>
							<span className="font-size-12 bold">{currentList[index].id}</span>

							<h2 className="text-base font-semibold mt-2">
								{currentList[index].name}
							</h2>

							<div className="row center">
								{currentList[index].types.join(", ")}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default App;
