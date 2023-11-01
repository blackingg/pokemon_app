import React, { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import "./index.css";
import { typeColors, statName } from "./setup";

function App() {
	const [currentList, setCurrentList] = useState([]);
	const [selectedPokemon, setSelectedPokemon] = useState(null);
	const [selectedSpecies, setSelectedSpecies] = useState(null);
	const [selectedEvo, setSelectedEvo] = useState(null);
	const [selectedEvoUrl, setSelectedEvoUrl] = useState(null);
	const [currentlyShowingAmount, setCurrentlyShowingAmount] = useState(0);
	const [maxIndex, setMaxIndex] = useState(29);

	const [pokemonList, setPokemonList] = useState([]);
	const [searchText, setSearchText] = useState("");
	const [loading, setLoading] = useState(false);
	const [loadingData, setDataLoading] = useState(true);

	// Function for fetching data and updating the state
	async function fetchData() {
		try {
			setDataLoading(true);
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
			setPokemonList(pokemonList);
			setDataLoading(false);
			//console.log(pokemonList);
		} catch (error) {
			console.error("Error fetching data:", error);
			setDataLoading(false);
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
				setMaxIndex((prevMaxIndex) => prevMaxIndex + 10);
			}
		}

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [currentList, currentlyShowingAmount]);

	async function openInfo(id) {
		const urlPokemon = "https://pokeapi.co/api/v2/pokemon/" + id;
		const urlSpecies = "https://pokeapi.co/api/v2/pokemon-species/" + id;
		const urlevoSpecies = "https://pokeapi.co/api/v2/evolution-chain/" + id;

		try {
			setLoading(true);
			const responsePokemon = await fetch(urlPokemon);
			const responseSpecies = await fetch(urlSpecies);
			const responseEvoSpecies = await fetch(urlevoSpecies);

			const pokemon = await responsePokemon.json();
			const species = await responseSpecies.json();
			const responseEvo = await fetch(species.evolution_chain.url);
			const evolution = await responseEvo.json();
			const evoSpecies = await responseEvoSpecies.json();

			//console.log(pokemon);
			//console.log(species);
			//console.log(evolution);
			//console.log(evoSpecies);

			setSelectedPokemon(pokemon);
			setSelectedSpecies(species);
			setSelectedEvo(evolution);
			setSelectedEvoUrl(evolution.chain.evolves_to[0].species.url);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching data:", error);
			setLoading(false);
		}
	}

	function handlePokemonClick(pokemon) {
		openInfo(pokemon.id);
	}

	function filterIdFromSpeciesURL(url) {
		return url
			.replace("https://pokeapi.co/api/v2/pokemon-species/", "")
			.replace("/", "");
	}

	async function search(searchText) {
		try {
			let searchResults = [];

			for (let i = 0; i < currentList.length; i++) {
				if (currentList[i].name) {
					if (
						currentList[i].name
							.replaceAll("-", " ")
							.includes(searchText.toLowerCase())
					) {
						searchResults.push(currentList[i]);
					}
				}
			}

			setCurrentList(searchResults);
			if (searchText === "") {
				resetSearch();
			} else {
				setCurrentlyShowingAmount(0);
				setMaxIndex(29);
			}
		} catch (error) {
			console.error("Error searching:", error);
		}
	}

	const handleInputChange = (e) => {
		const value = e.target.value;
		setSearchText(value);

		if (value === "") {
			resetSearch();
		} else {
			search(value);
		}
	};

	function resetSearch() {
		setSearchText("");
		setCurrentlyShowingAmount(0);
		setMaxIndex(29);
		setCurrentList(pokemonList);
	}

	return (
		<>
			{loadingData ? (
				<div
					className="w-full h-screen grid place-items-center bg-white"
					style={{ position: "fixed", top: 0, left: 0 }}
				>
					<div>
						<img
							className="motion-safe:animate-spin w-[50px]"
							src={`./pokeball-icon.png`}
							alt=""
						/>
					</div>
				</div>
			) : (
				<>
					<div className="bg-white flex w-[660px] p-4 mt-5 ml-0 md:ml-12 shadow-md rounded-3xl">
						<input
							id="search-input"
							className="w-fit flex-1 outline-none text-base text-blue-900 font-semibold"
							placeholder="Search your Pokemon"
							value={searchText}
							onChange={handleInputChange}
						/>
						<div className="bg-[#FF5350] text-white flex justify-center items-center w-10 h-10 drop-shadow-[5px_8px_10px_rgba(255,83,80,0.533)] rounded-xl">
							<AiOutlineSearch size={20} />
						</div>
					</div>
					<div className="w-fit px-10 min-h-screen justify-center items-center">
						<div>
							<div className="flex flex-wrap relative md:w-[75%]  md:mt-20 gap-10">
								{currentList.slice(0, maxIndex).map((pokemon) => (
									<div
										key={pokemon.id}
										className="bg-white flex flex-col justify-center items-center w-[42%] md:w-[22%] md:min-w-[200px] rounded-lg mt-16 md:mt-10  pt-10 p-5 relative cursor-pointer  hover:border-gray-300 shadow-md hover:shadow-none"
										onClick={() => handlePokemonClick(pokemon)}
									>
										<img
											className="absolute top-[-55px] pixelated transition duration-100  hover:scale-125"
											src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
											alt={pokemon.name}
										/>
										<span className="text-base text-gray-300 font-semibold ">
											N°{pokemon.id}
										</span>
										<h2 className="text-base  font-semibold mt-2">
											{pokemon.name}
										</h2>
										<div className="flex mt-2 space-x-2">
											{pokemon.types.map((type, Index) => (
												<div
													key={Index}
													className={`px-2 md:px-3 py-1 text-xs md:text-sm text-white rounded-md`}
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

						<div className="bg-white md:w-[27%] md:h-[70vh] md:fixed md:right-[calc(10vw-60px)] px-1 py-5 text-center bottom-0 mb-0 rounded-3xl absolute ">
							{selectedPokemon ? (
								<></>
							) : (
								<div className="flex h-full justify-center items-center">
									<span className="text-gray-300 w-[60%]  text-xl">
										Select a Pokemon to display here.
									</span>
								</div>
							)}
							{loading ? (
								<div className="w-full h-full grid place-items-center bg-white">
									<img
										className="motion-safe:animate-spin w-[50px]"
										src={`./pokeball-icon.png`}
										a
									/>
								</div>
							) : (
								selectedPokemon && (
									<div className="flex flex-col justify-center items-center">
										<div className="flex flex-col justify-center items-center mt-12">
											<img
												className="absolute top-[-93px] pixelated transition duration-100 max-w-[350px] h-[222px] max-h-[22vh]"
												src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${selectedPokemon.id}.gif`}
												alt={selectedPokemon.name}
											/>
											<div className="h-[54vh] pt-96 mt-7 flex flex-col justify-center items-center overflow-y-auto">
												<span className="text-base text-gray-300 font-semibold">
													N°{selectedPokemon.id}
												</span>
												<h2 className="text-base font-semibold">
													{selectedPokemon.name}
												</h2>
												<div className="flex mt-2 space-x-2">
													{selectedPokemon.types.map((typeData, Index) => (
														<div
															key={Index}
															className={`px-3 py-1 text-sm text-white rounded-md`}
															style={{
																background: typeColors[typeData.type.name],
															}}
														>
															{typeData.type.name}
														</div>
													))}
												</div>
												<div className="mt-5">
													<span className="text-base font-semibold">
														Pokedex Entry
													</span>
													<div className="text-gray-400 font-medium text-sm mt-2">
														{selectedSpecies.flavor_text_entries[9].flavor_text}
													</div>
												</div>
												<div className="mt-5 w-full p-3">
													<div className="grid grid-cols-2 mt-2 space-x-4 m-2">
														<div className="flex flex-col space-y-3">
															<span className="font-semibold">Height</span>
															<span className=" font-medium text-sm px-10 py-3 bg-gray-100 rounded-2xl">
																{selectedPokemon.height}m
															</span>
														</div>
														<div className="flex flex-col space-y-3">
															<span className="font-semibold">Weight</span>
															<span className="font-medium text-sm px-10 py-3 bg-gray-100 rounded-2xl">
																{selectedPokemon.weight} kg
															</span>
														</div>
													</div>
												</div>
												<div className="mt-5">
													<span className="text-base font-semibold">
														Abilities
													</span>
													<div className="grid grid-cols-2 space-x-4 mt-2">
														{selectedPokemon.abilities
															.slice(0, 2)
															.map((abilityType, Index) => (
																<div
																	key={Index}
																	className="font-medium text-sm px-10 py-3 bg-gray-100 rounded-2xl"
																>
																	{abilityType.ability.name}
																</div>
															))}
													</div>
												</div>
												<div className="mt-5">
													<span className="text-base font-semibold">Stats</span>
													<div className="flex space-x-4 mt-2">
														{selectedPokemon.stats.map((stat, index) => (
															<div
																key={index}
																className="flex flex-col font-medium text-[10px] p-1 rounded-3xl bg-gray-100 space-y-2"
															>
																<span
																	className="w-6 p-1 h-6 rounded-full"
																	style={{ background: statName[index].color }}
																>
																	{statName[index].name}
																</span>
																<span>{stat.base_stat}</span>
															</div>
														))}
													</div>
												</div>
												<div className="mt-5 space-y-1">
													<span className="text-base font-semibold">
														Evolution
													</span>
													<div className="flex">
														<div className="flex flex-row overflow-hidden">
															<img
																className="pixelated w-[200px] h-[222px] max-h-[27vh]"
																src={
																	"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" +
																	filterIdFromSpeciesURL(
																		selectedEvo.chain.species.url
																	) +
																	".png"
																}
																alt={selectedPokemon.name}
															/>
															<img
																className="pixelated w-[200px] h-[222px] max-h-[28vh]"
																src={
																	"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" +
																	filterIdFromSpeciesURL(selectedEvoUrl) +
																	".png"
																}
																alt={selectedPokemon.name}
															/>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								)
							)}
						</div>
					</div>
				</>
			)}
		</>
	);
}

export default App;
