import { CARD_ABILITY, CARD_TYPES } from "./Card.js";
import { BIG_NUMBER_FUNCTION, CRIT_MODIFIER } from "./constants.js";

export default function Evaluate(){
    let numbers = [];
    let operations = [];
    let abilities = [];

    for(let slot of this.card_slots.getChildren()){
        let card = slot.card;
        slot.card = null;

        if (card.ability !== CARD_ABILITY.NONE){
            abilities.push(card.ability);
        }

        if (card.type === CARD_TYPES.NUMBER){
            numbers.push( card.getNumber() );
            this.Discard(card);

        }
        else if(card.type == CARD_TYPES.OPERATOR){
            operations.push( card.getOperation() );
            this.Discard(card);
        }
    }



    this.answer = operations[0](numbers[0], numbers[1]);
    

    if (this.answer >= 1 && abilities.includes(CARD_ABILITY.CRIT)){
        critDamage(this);
    }
    else if(this.answer > 0 && this.answer < 1 && abilities.includes(CARD_ABILITY.DRAW)){
        drawCards(this);
    }
    else if(this.answer < 0 && abilities.includes(CARD_ABILITY.HEAL)){
        healPlayer(this);
    }
    else{
        dealDamage(this);
    }
    
    // if big number dies, increment iterations and create new bigger number
    if(this.big_number <= 0){
        this.iteration++;
        this.big_number = BIG_NUMBER_FUNCTION(this.iteration);
        this.Draft();
        this.StartNewRound();
    }   
    
}


function dealDamage(scene){
    scene.big_number -= scene.answer;
    scene.answer_text.setText(scene.answer);
    scene.answer_text.setColor("#ccc");
}

function healPlayer(scene){
    scene.player_health -= scene.answer;

    // TODO change to player HP scroll
    scene.answer_text.setText(scene.answer);
    scene.answer_text.setColor("#00ff00");
}

function drawCards(scene){

    // TODO figure out what we're doing here
    scene.Draw(1);

    scene.answer_text.setText("Draw 1");
    scene.answer_text.setColor("#0000ff");
}

function critDamage(scene){
    scene.big_number -= CRIT_MODIFIER*scene.answer;

    scene.answer_text.setText(CRIT_MODIFIER*scene.answer);
    scene.answer_text.setColor("#ff0000");
}