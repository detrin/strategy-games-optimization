// Stub for calling the function without considering all 5 officers and player class
function getProductionRate(techID, techLevel, energyTechLevel, plasmaTechLevel, maxTemp, pos, universeSpeedFactor, geologist, engineer, productionFactor, powerFactor, boosterType) {
	return getProductionRate(techID, techLevel, energyTechLevel, plasmaTechLevel, maxTemp, pos, universeSpeedFactor, geologist, engineer, productionFactor, powerFactor, boosterType, false, 1, false); // Default General class to avoid bonus
}

/**
 * Calculates resource production rate (units/hour) and energy.
 * @param techID ID of building - mine/synthesizer, power plant or solar satellite
 * @param techLevel building level or number of satellites
 * @param energyTechLevel energy technology level
 * @param plasmaTechLevel plasma technology level
 * @param maxTemp maximum planet temperature
 * @param pos planet position number
 * @param universeSpeedFactor universe speed multiplier
 * @param geologist Geologist officer flag
 * @param engineer Engineer officer flag
 * @param productionFactor production coefficient (0..1, <1 if energy insufficient)
 * @param powerFactor power percentage (0..1, set by user)
 * @param boosterType booster type: 0-none, 1-bronze (10%), 2-silver (20%), 3-gold (30%)
 * @param allOfficers flag for having all 5 officers
 * @param playerClass player class: 0-Collector, 1-General, 2-Explorer
 * @param isTrader does player belong to Trader alliance class
 * @returns Produced resources or energy amount
 */
function getProductionRate(techID, techLevel, energyTechLevel, plasmaTechLevel, maxTemp, pos, universeSpeedFactor, geologist, engineer, productionFactor, powerFactor, boosterType, allOfficers, playerClass, isTrader) {
	let prod;
	switch (techID*1) {
		case 1:
		case 2:
		case 3:
			prod = getProductionRateSplit(techID, techLevel, energyTechLevel, plasmaTechLevel, maxTemp, pos, universeSpeedFactor, geologist, engineer, productionFactor, powerFactor, boosterType, allOfficers, playerClass, isTrader);
			return(prod[0] + prod[1] + prod[2] + prod[3] + prod[4] + prod[5] + prod[6] + prod[7]);
		case 4:
		case 12:
		case 212:
			prod = getProductionRateSplit(techID, techLevel, energyTechLevel, plasmaTechLevel, maxTemp, pos, universeSpeedFactor, geologist, engineer, productionFactor, powerFactor, boosterType, allOfficers, playerClass, isTrader);
			return(prod[1]); // powerFactor considered, engineer/command/class bonuses applied to remaining energy sum
		default: {
			return(0);
		}
	}
}

/**
 * Calculates resource production rate (units/hour) and energy. For metal/crystal mines, first row shows natural production
 * @param techID ID of building - mine/synthesizer, power plant or solar satellite
 * @param techLevel building level or number of satellites
 * @param energyTechLevel energy technology level
 * @param plasmaTechLevel plasma technology level
 * @param maxTemp maximum planet temperature
 * @param pos planet position in solar system
 * @param universeSpeedFactor universe speed multiplier
 * @param geologist Geologist officer flag
 * @param engineer Engineer officer flag
 * @param productionFactor production coefficient (0..1, <1 if energy insufficient)
 * @param powerFactor power percentage (0..1, set by user)
 * @param boosterType booster type: 0-none, 1-bronze (10%), 2-silver (20%), 3-gold (30%)
 * @param allOfficers flag for having all 5 officers
 * @param playerClass player class: 0-Collector, 1-General, 2-Explorer
 * @param isTrader does player belong to Trader alliance class
 * @returns Produced resources or energy amount
 */
function getProductionRateSplit(techID, techLevel, energyTechLevel, plasmaTechLevel, maxTemp, pos, universeSpeedFactor, geologist, engineer, productionFactor, powerFactor, boosterType, allOfficers, playerClass, isTrader) {
	// Engineer and Geologist give +10% production. All 5 officers add +2% to resource/energy production
	var geologistFactor = geologist === true ? 0.1 : 0;
	var allStaffFactor = allOfficers === true ? 0.02 : 0;
	var engineerFactor = (engineer === true) ? 0.1 : 0;
	var boostFactor = boosterType * 0.1;
	var classFactor = playerClass === 0 ? 0.25 : 0;
	let allianceClassFactor = isTrader ? 0.05 : 0;
	var positionFactor = 1;
	var basePR;
	var rows = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // natural, mine, geologist, all officers, plasma, booster, class, alliance class
	switch (techID*1) {
		case 1:
			switch (pos*1) {
				case 6: case 10: positionFactor = 1.17; break;
				case 7: case 9: positionFactor = 1.23; break;
				case 8: positionFactor = 1.35; break;
				default: positionFactor = 1; 
			}
			rows[0] = Math.floor(30 * universeSpeedFactor * positionFactor);
			basePR = 30.0 * techLevel * Math.pow(1.1, techLevel) * productionFactor * powerFactor * positionFactor;
			rows[1] = Math.floor(basePR * universeSpeedFactor);
			rows[2] = Math.round(basePR * 0.01 * plasmaTechLevel * universeSpeedFactor);
			rows[3] = Math.round(basePR * boostFactor * universeSpeedFactor);
			rows[4] = Math.round(basePR * geologistFactor * universeSpeedFactor);
			rows[5] = 0; // Engineer in table
			rows[6] = Math.round(basePR * allStaffFactor * universeSpeedFactor);
			rows[7] = Math.round(basePR * classFactor * universeSpeedFactor);
			rows[8] = Math.round(basePR * allianceClassFactor * universeSpeedFactor);
			break;
		case 2:
			switch (pos*1) {
				case 1: positionFactor = 1.4; break;
				case 2: positionFactor = 1.296; break;
				case 3: positionFactor = 1.2; break;
				default: positionFactor = 1; 
			}
			rows[0] = Math.floor(15 * universeSpeedFactor * positionFactor);
			basePR = 20.0 * techLevel * Math.pow(1.1, techLevel) * productionFactor * powerFactor * positionFactor;
			rows[1] = Math.floor(basePR * universeSpeedFactor);
			rows[2] = Math.round(basePR * 0.0066 * plasmaTechLevel * universeSpeedFactor);
			rows[3] = Math.round(basePR * boostFactor * universeSpeedFactor);
			rows[4] = Math.round(basePR * geologistFactor * universeSpeedFactor);
			rows[5] = 0; 
			rows[6] = Math.round(basePR * allStaffFactor * universeSpeedFactor);
			rows[7] = Math.round(basePR * classFactor * universeSpeedFactor);
			rows[8] = Math.round(basePR * allianceClassFactor * universeSpeedFactor);
			break;
		case 3:			
			rows[0] = 0;
			basePR = 10.0 * techLevel * Math.pow(1.1, techLevel) * (1.44 - 0.004 * maxTemp) * productionFactor * powerFactor;
			rows[1] = Math.floor(basePR * universeSpeedFactor);
			rows[2] = Math.round(basePR * 0.0033 * plasmaTechLevel * universeSpeedFactor);
			rows[3] = Math.round(basePR * boostFactor * universeSpeedFactor);
			rows[4] = Math.round(basePR * geologistFactor * universeSpeedFactor);
			rows[5] = 0; 
			rows[6] = Math.round(basePR * allStaffFactor * universeSpeedFactor);
			rows[7] = Math.round(basePR * classFactor * universeSpeedFactor);
			rows[8] = Math.round(basePR * allianceClassFactor * universeSpeedFactor);
			break;
		case 4:
			basePR = Math.floor(20.0 * techLevel * Math.pow(1.1, techLevel) * powerFactor);
			rows[1] = Math.floor(basePR);
			break;
		case 12:
			basePR = Math.floor(30.0 * techLevel * Math.pow((1.05 + energyTechLevel * 0.01), techLevel) * powerFactor);
			rows[1] = Math.floor(basePR);
			break;
		case 212:
			basePR = techLevel * Math.floor((maxTemp + 140) / 6) * powerFactor;
			if (basePR < 0) {
				basePR = 0;
			}
			rows[1] = Math.floor(basePR);
	}
	return rows;
}

/**
 * Calculates energy consumption for mines and deuterium consumption for fusion plant
 * @param techID ID of mine or power plant
 * @param techLevel building level
 * @param universeSpeedFactor universe speed multiplier
 * @param powerFactor power percentage (0..1, set by user)
 * @returns Consumed energy/deuterium amount
 */
function getHourlyConsumption(techID, techLevel, universeSpeedFactor, powerFactor) {
	if (techLevel < 1)
		return 0;
	var consump;
	switch (techID*1) {
		case 1: // metal mine energy consumption
		case 2: // crystal mine energy consumption
			consump = Math.floor(10.0 * techLevel * Math.pow(1.1, techLevel) * powerFactor);
			break;
		case 12: // fusion plant deuterium consumption
			consump = Math.floor(Math.floor(10.0 * techLevel * Math.pow(1.1, techLevel) * universeSpeedFactor) * powerFactor);
			break;
		case 3: // deuterium synthesizer energy consumption
			consump = Math.floor(20.0 * techLevel * Math.pow(1.1, techLevel) * powerFactor);
			break;
		default:
			return 0;
	}
	return consump;
}

/**
 * Calculates resource storage capacity
 * @param level building level
 * @returns Storage capacity
 */
function getStorageCapacity(level) {
	if (level < 0)
		return 0;
	if (level == 0)
		return 10000;
	return 5000 * Math.floor(2.5 * Math.exp(20.0 * level/33.0));
}

/**
 * Calculates energy required for research/construction
 * @param techID ID of building/research
 * @param techLevel research/building level
 * @param techData tech data array format {id:[cost_met, cost_crys, cost_deut, grow_koeff]}
 * @returns Required energy
 */
function getBuildEnergyCost_C(techID, techLevel, techData) {
	if (techLevel < 1)
		return 0;
	var data = techData[techID];
	if (data === undefined)
		return [0, 0, 0];
	var buildCost = 0;
	switch (techID*1) {
		case 33:
			buildCost = 1000 * Math.pow(data[3], techLevel - 1);
			break;
		case 36:
			buildCost = Math.floor(50 * Math.pow(data[3]/2, techLevel - 1)); 
			break;
		case 199:
			buildCost = 300000 * Math.pow(data[3], techLevel - 1);
			break;
		default:
			buildCost = 0;
	}
	return buildCost;
}

/**
 * Calculates building demolition cost
 * @param techID building ID
 * @param techLevel target building level
 * @param techData tech data array format {id:[cost_met, cost_crys, cost_deut, grow_koeff]}
 * @returns Demolition cost
 */
function calcDeconstrCost(techID, techLevel, techData, ionTechLevel) {
	var cost = [0, 0, 0];
	if (techLevel < 0) {
		return cost;
	}
	if (techID > 100 || techID == 33 || techID == 41) {
		return cost;
	}
	var data = techData[techID];
	for (var i = 0; i < 3; i++)
		cost[i] = Math.floor(Math.floor(data[i] * Math.pow(data[3], techLevel - 1)) * (1 - 0.04 * ionTechLevel));
	return cost;
}

/**
 * Calculates research/construction cost
 * @param techID building/research ID
 * @param techLevel research/building level
 * @param techData tech data array format {id:[cost_met, cost_crys, cost_deut, grow_koeff]}
 * @returns Construction/research cost
 */
function calcBuildCost_C(techID, techLevel, techData) {
	if (techLevel < 1)
		return [0, 0, 0];
	var data = techData[techID];
	if (data === undefined)
		return [0, 0, 0];
	var cost = [0, 0, 0];
	var price = 0;
	if (techID == 124) {
		for (var i = 0; i < 3; i++) {
			price = data[i] * Math.pow(1.75, (techLevel - 1));
			cost[i] = 100 * Math.round(0.01 * price);
		}
	} else {
		for (var i = 0; i < 3; i++)
			cost[i] = Math.floor(data[i] * Math.pow(data[3], (techLevel - 1)));
	}
	return cost;
}

/**
 * Calculates total upgrade cost for multiple levels
 * @param techID building/research ID
 * @param techLevelFrom starting level (exclusive)
 * @param techLevelTo target level
 * @param techData tech data array format {id:[cost_met, cost_crys, cost_deut, grow_koeff]}
 * @param ionTechLevel ion technology level
 * @returns Total upgrade cost
 */
function getBuildCost_C(techID, techLevelFrom, techLevelTo, techData, ionTechLevel) {
	let cost;
	let i;
	if (typeof ionTechLevel == "undefined" )
		ionTechLevel = 0;
	let totalCost = [0, 0, 0];
	if (techID < 200) {
		if (1*techLevelFrom > techLevelTo) {
			for (i = 1*techLevelFrom - 1; i >= techLevelTo; i--) {
				cost = calcDeconstrCost(techID, i, techData, ionTechLevel);
				totalCost[0] += cost[0];
				totalCost[1] += cost[1];
				totalCost[2] += cost[2];
			}
		} else {
			for (i = 1*techLevelFrom + 1; i <= techLevelTo; i++) {
				cost = calcBuildCost_C(techID, i, techData);
				totalCost[0] += cost[0];
				totalCost[1] += cost[1];
				totalCost[2] += cost[2];
			}
		}
	} else {
		cost = calcBuildCost_C(techID, 1, techData);
		totalCost[0] = techLevelTo * cost[0];
		totalCost[1] = techLevelTo * cost[1];
		totalCost[2] = techLevelTo * cost[2];
	}
	return totalCost;
}

/**
 * Calculates the duration of researching/building multiple levels or multiple ships
 * @param techID ID of the building or research
 * @param techLevelFrom Starting level of building/research (not included in calculation)
 * @param techLevelTo Target level of building/research
 * @param techData Array of technology data in format {id:[cost_met, cost_crys, cost_deut, grow_koeff]}
 * @param robotsLevel Robots Factory level
 * @param nanitesLevel Nanite Factory level
 * @param researchLabLevel Research Lab level
 * @param technocratFactor Technocrat multiplier - 1 if absent
 * @param shipyardLevel Shipyard level
 * @param uniSpeed Universe speed
 * @param techReqs Research requirements in format {id: req_level}
 * @returns Total upgrade/build duration for buildings/research, ship construction 
 */
function getBuildTime_C(techID, techLevelFrom, techLevelTo, techData, robotsLevel, nanitesLevel, researchLabLevel, technocratFactor, shipyardLevel, uniSpeed, techReqs) {
	if (techLevelFrom < 0)
		return 0;
	var data = techData[techID];
	if (data === undefined)
		return 0;
	if (techLevelFrom >= techLevelTo && techID > 100)
		return 0;
	var timeSpan = 0;
	var reduction = 1;
	// Get the build cost - it's used in the build time calculation formulas
	var cost = [0, 0, 0];
	// IDs <= 100 are buildings. Their build speed depends on Robots Factory and Nanite Factory levels
	if (techID <= 100) {
		if (techLevelFrom < techLevelTo) {
			var curr = 1*techLevelFrom;
			for (var next = 1*techLevelFrom + 1; next <= techLevelTo; next++) {
				cost = getBuildCost_C(techID, curr, next, techData);
				// Build time reduction for all buildings except Nanite Factory, Lunar Base, Phalanx and Jump Gate (up to level 8)
				reduction = 1;
				if (techID != 15 && techID != 41 && techID != 42 && techID != 43) 
					reduction = Math.max(4 - next / 2.0, 1);
				// OGame formula gives time in hours - convert to seconds
				timeSpan += Math.floor(3600 * (cost[0] + cost[1]) / (2500.0 * reduction * (robotsLevel + 1.0) * Math.pow(2.0, nanitesLevel)));
				curr = next;
			}
		} else {
			// Terraformer and Lunar Base cannot be demolished
			if (techID == 33 || techID == 41)
				return 0;
			var curr = 1*techLevelFrom;
			for (var next = 1*techLevelFrom - 1; next >= techLevelTo; next--) {
				cost = getBuildCost_C(techID, curr, next, techData);
				reduction = 1;
				if (techID != 15 && techID != 41 && techID != 42 && techID != 43) 
					reduction = Math.max(4 - next / 2.0, 1);
				// OGame formula gives time in hours - convert to seconds
				timeSpan += Math.ceil(3600 * (cost[0] + cost[1]) / (2500.0 * reduction * (robotsLevel + 1.0) * Math.pow(2.0, nanitesLevel)));
				curr = next;
			}
		}
	}

	// IDs 100-200 are researches. Their speed depends on Research Lab level and Technocrat
	if (100 < techID && techID <= 200) {
		if (researchLabLevel < techReqs[techID])
			return -1;
		cost = getBuildCost_C(techID, techLevelFrom, techLevelTo, techData);
		// OGame formula gives time in hours - convert to seconds
		timeSpan = 3600 * (cost[0] + cost[1]) / (1000 * (1.0 + researchLabLevel));
		// Apply Technocrat multiplier if present
		timeSpan *= technocratFactor;
	}

	// IDs >200 are ships/defense. Build speed depends on Shipyard and Nanite Factory levels
	if (techID > 200) {
		// For ships/defense, calculate per unit and multiply by quantity
		cost = calcBuildCost_C(techID, 1,  techData);
		//((metal + crystal) / 5'000) * (2 / ((level shipyard) + 1)) * (0.5 ^ (level nanite factory))
		// Convert hours to seconds, round and multiply by quantity
		timeSpan = 3600 * (cost[0] + cost[1]) / 5000.0 * 2.0 / (shipyardLevel + 1.0) * Math.pow(0.5, nanitesLevel);
		// Prevent zero time for high nanite levels
		if (timeSpan == 0) {
			timeSpan = 1;
		}
	}
	// Apply universe speed multiplier
	if (uniSpeed > 1) {
		timeSpan /= uniSpeed;
	}
	if (timeSpan < 1) {
		timeSpan = 1;
	}
	if (techID > 200) {
		timeSpan = techLevelTo*Math.floor(timeSpan);
	}

	return timeSpan;
}

/**
 * Calculates DM cost for halving build/research time
 * @param techID ID of building, ship or research
 * @param timeSpan Original time required for building/research
 * @returns Required DM amount
 */
function getHalvingCost(techID, timeSpan) {
	if (Number(timeSpan) === 0)
		return 0;
	let tmCost = 750;
	if (techID < 200 && timeSpan > 1800) {
		let halves = Math.ceil(Math.ceil(timeSpan/60)/30);
		tmCost = 750 * halves;
		if (techID < 100 && tmCost > 72000)
			tmCost = 72000;
		if (techID > 100 && techID < 200 && tmCost > 108000)
			tmCost = 108000;
		return tmCost;
	}
	if (techID > 200 && timeSpan > 1800) {
		let halves = 0.1 * Math.ceil(Math.floor(timeSpan/60)/3);
		tmCost = Math.floor(750 * halves);
		if (tmCost > 72000)
			tmCost = 72000;
		return tmCost;
	}
	return tmCost;
}

/**
 * Calculates deconstruction cost for Lifeforms
 * @param techID Building ID
 * @param techLevel Target building level
 * @param techData Technology data array in format {id:[cost_met, cost_crys, cost_deut, cost_energy, grow_koeff]}
 * @returns Deconstruction cost
 */
function calcDeconstrCostLF(techID, techLevel, techData, ionTechLevel) {
	var cost = [0, 0, 0];
	if (techLevel < 0) {
		return cost;
	}
	// Only buildings can be deconstructed
	if (Number(techID) % 1000 > 100) {
		return cost;
	}
	var data = techData[techID];
	for (var i = 0; i < 3; i++)
		cost[i] = Math.floor(Math.floor(data[i] * techLevel * Math.pow(data[5 + i], techLevel - 1)) * (1 - 0.04 * ionTechLevel));
	return cost;
}

/**
 * Calculates build/research cost for Lifeforms
 * @param techID Building/research ID
 * @param techLevel Building/research level
 * @param techData Technology data array in format {id:[cost_met, cost_crys, cost_deut, cost_energy, grow_koeff]}
 * @param costRdc Cost reduction bonus (in %)
 * @returns Build/research cost for specified technology level
 */
function calcBuildCostLF(techID, techLevel, techData, costRdc) {
	if (techLevel < 1)
		return [0, 0, 0];
	var data = techData[techID];
	if (data === undefined)
		return [0, 0, 0];
	var cost = [0, 0, 0];
	costRdc = Math.min(0.99, costRdc);
	for (var i = 0; i < 3; i++)
		cost[i] = Math.floor((1 - costRdc) * Math.floor(data[i] * techLevel * Math.pow(data[5 + i], (techLevel - 1))));
	return cost;
}

/**
 * Calculates total upgrade cost for Lifeforms
 * @param techID Building/research ID
 * @param techLevelFrom Starting level (not included)
 * @param techLevelTo Target level
 * @param techData Technology data array in format {id:[cost_met, cost_crys, cost_deut, cost_energy, grow_koeff]}
 * @param ionTechLevel Ion Technology level
 * @param rsrCostRdc Research cost reduction (in %)
 * @param bldCostRdc Building cost reduction
 * @returns Total upgrade cost 
 */
function getBuildCostLF(techID, techLevelFrom, techLevelTo, techData, ionTechLevel, rsrCostRdc, bldCostRdc=0) {
	let cost;
	let i;
	if (typeof ionTechLevel == "undefined" )
		ionTechLevel = 0;
	let totalCost = [0, 0, 0];
	// Megalith reduces only building costs
	const costReduction = Number(techID) % 1000 < 100 ? bldCostRdc : 0.01 * rsrCostRdc;
	// Calculate deconstruction cost if downgrading
	if (Number(techLevelFrom) > Number(techLevelTo)) {
		for (i = Number(techLevelFrom) - 1; i >= Math.max(Number(techLevelTo), 0); i--) {
			if (i == 0) {
				cost = calcDeconstrCostLF(techID, 1, techData, ionTechLevel);
			} else {
				cost = calcDeconstrCostLF(techID, i, techData, ionTechLevel);
			}
			totalCost[0] += cost[0];
			totalCost[1] += cost[1];
			totalCost[2] += cost[2];
		}
	} else {
		// Sum build costs for all levels
		for (i = Number(techLevelFrom) + 1; i <= Number(techLevelTo); i++) {
			cost = calcBuildCostLF(techID, i, techData, costReduction);
			totalCost[0] += cost[0];
			totalCost[1] += cost[1];
			totalCost[2] += cost[2];
		}
	}
	return totalCost;
}

/**
 * Calculates build/research duration for Lifeforms
 * @param techID Building/research ID
 * @param techLevelFrom Starting level (not included)
 * @param techLevelTo Target level
 * @param techData Technology data array in format {id:[cost_met, cost_crys, cost_deut, cost_energy, grow_koeff]}
 * @param robotsLevel Robots Factory level
 * @param nanitesLevel Nanite Factory level
 * @param uniSpeed Universe speed
 * @param rsrTimeRdc Research time reduction (in %)
 * @param megalithRdc Megalith bonus
 * @returns Total upgrade/build duration 
 */
function getBuildTimeLF(techID, techLevelFrom, techLevelTo, techData, robotsLevel, nanitesLevel, uniSpeed, rsrTimeRdc, megalithRdc=0) {
	if (techLevelFrom < 0)
		return 0;
	var data = techData[techID];
	if (data === undefined)
		return 0;
	if (techLevelFrom >= techLevelTo && Number(techID) % 1000 > 100)
		return 0;
	var timeSpan = 0;
	// Buildings (ID <=100) depend on Robots Factory and Nanites
	if (Number(techID) % 1000 <= 100) {
		if (techLevelFrom < techLevelTo) {
			for (var next = Number(techLevelFrom) + 1; next <= Number(techLevelTo); next++) {
				timeSpan += Math.floor((next * data[4] * Math.pow(data[9], next)) / ((robotsLevel + 1.0) * Math.pow(2.0, nanitesLevel)));
			}
		} else {
			for (var next = Number(techLevelFrom) - 1; next >= Math.max(Number(techLevelTo), 0); next--) {
				if (next == 0) {
					timeSpan += Math.floor((data[4] * Math.pow(data[9], 1)) / ((robotsLevel + 1.0) * Math.pow(2.0, nanitesLevel)));
				} else {
					timeSpan += Math.floor((next * data[4] * Math.pow(data[9], next)) / ((robotsLevel + 1.0) * Math.pow(2.0, nanitesLevel)));
				}
			}
		}
		timeSpan = Math.floor(timeSpan * (1 - megalithRdc));
		timeSpan = Math.floor(timeSpan / uniSpeed);
	} else {
		// Researches (ID >100) depend on time reduction factors
		if (techLevelFrom < techLevelTo) {
			for (var next = Number(techLevelFrom) + 1; next <= Number(techLevelTo); next++) {
				let duration = Math.floor(next * data[4] * Math.pow(data[9], next));
				duration = Math.floor(duration * (1 - 0.01 * rsrTimeRdc));
				timeSpan += Math.floor(duration / uniSpeed);
			}
		}
	}

	if (timeSpan < 1) {
		timeSpan = 1;
	}

	return timeSpan;
}

/**
 * Calculates energy cost for Lifeforms buildings/research
 * @param techID Building/research ID
 * @param techLevel Technology level
 * @param techData Technology data array in format {id:[cost_met, cost_crys, cost_deut, cost_energy, grow_koeff]}
 * @param ionTechLevel Ion Technology level
 * @returns Required energy
 */
function getBuildEnergyCostLF(techID, techLevel, techData, ionTechLevel) {
	if (techLevel < 1)
		return 0;
	var data = techData[techID];
	if (data === undefined)
		return 0;
	buildCost = Math.floor(Math.floor(data[3] * techLevel * Math.pow(data[8], techLevel)) * (1 - 0.04 * ionTechLevel));
	return buildCost;
}