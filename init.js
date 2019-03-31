/*Copyright 2019 Kirk McDonald

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/
import { getBelts } from "./belt.js"
import { getBuildings } from "./building.js"
import { clickTab } from "./events.js"
import { spec } from "./factory.js"
import { loadSettings } from "./fragment.js"
import { getItems } from "./item.js"
import { Rational } from "./rational.js"
import { getRecipes } from "./recipe.js"
import { renderSettings } from "./settings.js"

export let initDone = false

function loadData(settings) {
    d3.json("data/data.json").then(function(data) {
        let items = getItems(data)
        let recipes = getRecipes(data, items)
        let buildings = getBuildings(data)
        let belts = getBelts(data)
        spec.setData(items, recipes, buildings, belts)

        renderSettings(settings)

        let targetSetting = settings.get("items")
        if (targetSetting !== undefined && targetSetting !== "") {
            let targets = targetSetting.split(",")
            for (let targetString of targets) {
                let parts = targetString.split(":")
                let itemKey = parts[0]
                let target = spec.addTarget(itemKey)
                let type = parts[1]
                if (type === "f") {
                    target.setBuildings(parts[2])
                } else if (type === "r") {
                    target.setRate(parts[2])
                } else {
                    throw new Error("unknown target type")
                }
            }
        } else {
            spec.addTarget()
        }
        let ignoreSetting = settings.get("ignore")
        if (ignoreSetting !== undefined && ignoreSetting !== "") {
            let ignore = ignoreSetting.split(",")
            for (let recipeKey of ignore) {
                let recipe = spec.recipes.get(recipeKey)
                spec.ignore.add(recipe)
            }
        }
        let overclockSetting = settings.get("overclock")
        if (overclockSetting !== undefined && overclockSetting !== "") {
            let overclock = overclockSetting.split(",")
            for (let pair of overclock) {
                let [recipeKey, percentString] = pair.split(":")
                let recipe = spec.recipes.get(recipeKey)
                let percent = Rational.from_string(percentString).div(Rational.from_float(100))
                spec.setOverclock(recipe, percent)
            }
        }
        initDone = true
        spec.updateSolution()
    })
}

export function init() {
    let settings = loadSettings(window.location.hash)
    loadData(settings)
}
