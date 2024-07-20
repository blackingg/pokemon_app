import React, { useEffect, useState } from "react";
import "./index.css";
import { typeColors, statName } from "./setup";
import { GrFormClose } from "react-icons/gr";

function App() {
  const [currentList, setCurrentList] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [selectedEvo, setSelectedEvo] = useState(null);
  const [selectedEvoUrl, setSelectedEvoUrl] = useState(null);
  const [selectedEvoFinalUrl, setSelectedEvoFinalUrl] = useState(null);
  const [minLevel, setMinLevel] = useState(null);
  const [minLevel2, setMinLevel2] = useState(null);
  const [currentlyShowingAmount, setCurrentlyShowingAmount] = useState(0);
  const [maxIndex, setMaxIndex] = useState(29);

  const [pokemonList, setPokemonList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setDataLoading] = useState(true);
  const [pokemonInfoOpen, setPokemonInfoOpen] = useState(false);

  // Function for fetching data and updating the state
  async function fetchData() {
    try {
      setDataLoading(true);
      const response = await fetch(
        "https://pokemon-app-backend.vercel.app/api/pokemon"
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

      setSelectedPokemon(pokemon);
      setSelectedSpecies(species);
      setSelectedEvo(evolution);
      setSelectedEvoUrl(evolution.chain.evolves_to[0].species.url);
      setSelectedEvoFinalUrl(
        evolution.chain.evolves_to[0].evolves_to[0].species.url
      );

      setMinLevel(
        evoSpecies.chain.evolves_to.map((level, index) => (
          <>
            <div key={index}>
              <span className="flex">
                Lvl {level.evolution_details[0].min_level}
              </span>
            </div>
          </>
        ))
      );

      const secondMinLevel =
        evoSpecies.chain.evolves_to[0].evolves_to[0].evolution_details[0]
          .min_level;
      setMinLevel2(
        <div>
          <span className="flex">Lvl {secondMinLevel}</span>
        </div>
      );

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

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (value === "") {
      resetSearch();
    } else {
      search(searchText);
    }
  };

  function resetSearch() {
    setSearchText("");
    setCurrentlyShowingAmount(0);
    setMaxIndex(29);
    setCurrentList(pokemonList);
  }

  async function search(searchText) {
    try {
      const searchResults = pokemonList.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchText.toLowerCase())
      );

      console.log("searchText: ", searchText);
      console.log("searchResults: ", searchResults);

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

  function closePokemonInfo() {
    setSelectedPokemon(null);
    setPokemonInfoOpen(false);
  }

  return (
    <>
      {pokemonInfoOpen && loadingData ? (
        <div
          className="w-full h-screen grid place-items-center bg-white"
          style={{ position: "fixed", top: 0, left: 0 }}
        >
          <div>
            <img
              className="motion-safe:animate-spin w-[50px] "
              src={`./pokeball-icon.png`}
              alt=""
            />
          </div>
        </div>
      ) : (
        <>
          <div className="flex space-x-3 md:space-x-8 lg:space-x-10 px-10 md:px-0">
            <div className="bg-white flex w-[200px] md:w-[840px] p-4 mt-5 ml-0 md:ml-12 shadow-md rounded-3xl">
              <input
                id="search-input"
                className="w-full md:w-fit flex-1 outline-none text-base text-blue-900 "
                placeholder="Search your Pokemon"
                value={setSearchText}
                onChange={handleInputChange}
              />
              <div className="bg-[#FF5350] text-white flex justify-center items-center w-10 h-10 drop-shadow-[5px_8px_10px_rgba(255,83,80,0.533)] rounded-xl">
                <img
                  className="w-[25px]"
                  src={`./pokeball-icon.png`}
                />
              </div>
            </div>
            <div className="bg-blue-100 text-xs md:text-base flex justify-center items-center p-5 mt-5 shadow-md rounded-3xl">
              <a
                target="_blank"
                href="https://dribbble.com/shots/15128634-Pokemon-Pokedex-Website-Redesign-Concept"
              >
                Link to Design
              </a>
            </div>
          </div>

          <div className="w-fit min-h-screen justify-center items-center">
            <>
              <div
                className={`${
                  selectedPokemon == null && !loading ? "z-20" : ""
                } flex flex-wrap px-5 md:px-0 lg:px-10 relative md:w-[75%] md:mt-20 gap-3 md:gap-4 lg:gap-10`}
              >
                {currentList.slice(0, maxIndex).map((pokemon) => (
                  <div
                    key={pokemon.id}
                    className="bg-white flex flex-col justify-center items-center w-[48%] min-w-[140px] md:min-w-[180px] lg:min-w-[200px] md:w-[40%] lg:w-[22%] rounded-lg mt-16 md:mt-10  pt-10 p-5 relative cursor-pointer hover:border-gray-300 shadow-md hover:shadow-none"
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
                          style={{
                            background: typeColors[type],
                          }}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
            <>
              <div
                className={`lg:bg-white fixed w-screen h-screen lg:w-[27%] lg:h-[70vh] md:fixed md:right-[calc(10vw-77.2px)] lg:right-[calc(10vw-60px)] py-0 text-center top-[38%] md:top-[400px] lg:top-56 mb-0 rounded-3xl`}
              >
                {selectedPokemon ? (
                  <></>
                ) : (
                  <div className="hidden lg:flex h-full justify-center items-center">
                    <img
                      className="absolute top-[-93px] pixelated transition duration-100 max-w-[350px] h-[222px] max-h-[22vh]"
                      src="/no-pokemon-selected-image.png"
                    />
                    <span className="text-gray-300 w-[60%] text-xl">
                      Select a Pokemon to display here.
                    </span>
                  </div>
                )}
                {loading ? (
                  <>
                    <div className=" lg:visible z-30 w-full h-full grid place-items-center bg-white">
                      <img
                        className="lg:visible motion-safe:animate-spin w-[50px]"
                        src={`./pokeball-icon.png`}
                      />
                    </div>
                    <div className="fixed lg:hidden bg-white opacity-100 h-screen w-screen grid place-items-center top-0 transition duration-350">
                      <img
                        className="lg:hidden motion-safe:animate-spin w-[50px]"
                        src={`./pokeball-icon.png`}
                      />
                    </div>
                  </>
                ) : (
                  selectedPokemon && (
                    <>
                      {selectedPokemon.types.map((typeData, Index) => (
                        <div
                          key={Index}
                          style={{
                            background: typeColors[typeData.type.name],
                          }}
                          className="fixed lg:hidden opacity-100 h-screen w-screen top-0 transition duration-350"
                        ></div>
                      ))}
                      <div
                        onClick={closePokemonInfo}
                        className="fixed top-10 flex justify-center items-center right-10 bg-gray-100 cursor-pointer z-20 rounded-lg lg:hidden transition duration-350"
                      >
                        <GrFormClose size={30} />
                      </div>
                      <div className="bg-white w-screen h-fit lg:w-fit px-1 rounded-t-3xl lg:rounded-3xl absolute flex flex-col justify-center items-center z-1">
                        <div className="flex flex-col justify-center items-center mt-12">
                          <img
                            className="absolute top-[-93px] pixelated transition duration-100 max-w-[350px] h-[222px] max-h-[22vh]"
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${selectedPokemon.id}.gif`}
                            alt={selectedPokemon.name}
                          />
                          <div className="h-[54vh] pt-[22rem] mt-7 flex flex-col justify-center items-center overflow-y-auto">
                            <span className="text-base text-gray-300 font-semibold">
                              N°
                              {selectedPokemon.id}
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
                              <div className="text-gray-400 px-5 font-medium text-sm mt-2">
                                {
                                  selectedSpecies.flavor_text_entries[10]
                                    .flavor_text
                                }
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
                              <span className="text-base font-semibold">
                                Stats
                              </span>
                              <div className="flex space-x-4 mt-2">
                                {selectedPokemon.stats.map((stat, index) => (
                                  <div
                                    key={index}
                                    className="flex flex-col font-medium text-[10px] p-1 rounded-3xl bg-gray-100 space-y-2"
                                  >
                                    <span
                                      className="w-6 p-1 h-6 rounded-full"
                                      style={{
                                        background: statName[index].color,
                                      }}
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
                                <div className="flex flex-row justify-center items-center overflow-hidden">
                                  <img
                                    className="pixelated"
                                    src={
                                      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" +
                                      filterIdFromSpeciesURL(
                                        selectedEvo.chain.species.url
                                      ) +
                                      ".png"
                                    }
                                    alt={selectedPokemon.name}
                                  />
                                  {minLevel !== null && (
                                    <div className="p-[5px] text-sm text-gray-500 rounded-3xl bg-gray-100">
                                      {minLevel}
                                    </div>
                                  )}
                                  <img
                                    className="pixelated relative -top-1"
                                    src={
                                      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" +
                                      filterIdFromSpeciesURL(selectedEvoUrl) +
                                      ".png"
                                    }
                                    alt={selectedPokemon.name}
                                  />
                                  {minLevel2 !== null && (
                                    <div className="p-[5px] text-sm text-gray-500 rounded-3xl bg-gray-100">
                                      {minLevel2}
                                    </div>
                                  )}
                                  <img
                                    className="pixelated relative -top-1"
                                    src={
                                      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" +
                                      filterIdFromSpeciesURL(
                                        selectedEvoFinalUrl
                                      ) +
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
                    </>
                  )
                )}
              </div>
            </>
          </div>
        </>
      )}
    </>
  );
}
export default App;
