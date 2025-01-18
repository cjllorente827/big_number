
import { Card, CARD_ABILITY } from "./Card.js";
import { DEFAULT_CARDS_DRAFTED, OFF_SCREEN_X, OFF_SCREEN_Y } from "./constants.js";


const ABILITY_CHANCE = 0.333;
//const ABILITY_CHANCE = 1.0;
const OPERATOR_CHANCE = 0.333;

// returns a list of cards chosen randomly for the purposes
// of allowing the user a choice of which to draft
export default function DraftCards(){

    var card_list = [];

    for (let i = 0; i < DEFAULT_CARDS_DRAFTED; i++){

        let value = null;
        let ability = CARD_ABILITY.NONE;
        let ability_roll = Math.random();
        let operator_roll = Math.random();

        if(operator_roll < OPERATOR_CHANCE){
            value = chooseOperator();
        }
        else{
            value = chooseNumber();
        }

        if(ability_roll < ABILITY_CHANCE){
            ability = chooseAbility();
        }

        let new_card = new Card(
            this, OFF_SCREEN_X, OFF_SCREEN_Y, value, ability
        );
        
        this.add.existing(new_card);
        card_list.push(new_card);
    }
    
    return card_list;
}

function chooseNumber(){

    const probability_thresholds = Object.freeze({
        1: 0.0227501319482,
        2: 0.0668072012689,
        3: 0.158655253931,
        4: 0.308537538726,
        5: 0.5,
        6: 0.691462461274,
        7: 0.841344746069,
        8: 0.933192798731,
        9: 0.977249868052
    });

    let rand = Math.random();

    for (let [number, threshold] of Object.entries(probability_thresholds)) {
        if (rand <= threshold){
            return number;
        }
    }

    return 10;
}

function chooseOperator(){
    const probability_thresholds = Object.freeze({
        '+': 0.25,
        '-': 0.5,
        'x': 0.75,
        '/': 1.0,
        '^': -1, // Not yet implemented (should be rare)
        '=': -1, // Not yet implemented (should be rare)
        '±': -1  // Not yet implemented (should be rare)
    });

    let rand = Math.random();

    for (let [operator, threshold] of Object.entries(probability_thresholds)) {
        if (rand <= threshold){
            return operator;
        }
    }

    return '/';
}

function chooseAbility(){
    const probability_thresholds = Object.freeze({
        "heal": 0.33,
        "draw": 0.67,
        "crit": 1.00
    });

    let rand = Math.random();

    for (let [ability, threshold] of Object.entries(probability_thresholds)) {
        if (rand <= threshold){
            return ability;
        }
    }

    return CARD_ABILITY.NONE;
}