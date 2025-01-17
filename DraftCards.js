
import { Card, CARD_ABILITY } from "./Card.js";
import { DEFAULT_CARDS_DRAFTED, OFF_SCREEN_X, OFF_SCREEN_Y } from "./constants.js";

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

// returns a list of cards chosen randomly for the purposes
// of allowing the user a choice of which to draft
export default function DraftCards(){

    var card_list = [];

    for (let i = 0; i < DEFAULT_CARDS_DRAFTED; i++){

        let value = 10;
        let rand = Math.random();

        for (let [number, threshold] of Object.entries(probability_thresholds)) {
            if (rand < threshold){
                value = number;
                break;
            }
        }

        let new_card = new Card(
            this, OFF_SCREEN_X, OFF_SCREEN_Y, value, CARD_ABILITY.NONE,);
        this.add.existing(new_card);
        card_list.push(new_card);
    }
    
    return card_list;
}