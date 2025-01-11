
import { Card } from "./Card.js";
import { DEFAULT_CARDS_DRAFTED, OFF_SCREEN_X, OFF_SCREEN_Y } from "./constants.js";
// returns a list of cards chosen randomly for the purposes
// of allowing the user a choice of which to draft
export default function DraftCards(){

    //TODO: Create a function that randomly determines which cards to create


    var card_list = [];

    // create the card objects once values have been decided
    for (let i = 0; i < DEFAULT_CARDS_DRAFTED; i++){
        let new_card = new Card(this, OFF_SCREEN_X, OFF_SCREEN_Y, 4);
        this.add.existing(new_card);
        card_list.push(new_card);
    }
    
    return card_list;
}