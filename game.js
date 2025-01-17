import {Card, CARD_SCALE, CARD_TYPES, CARD_ABILITY} from "./Card.js";
import DraftCards from "./DraftCards.js";
import { createGUI, updateGUI, setupModalForDraft, setupModalForGameOver, hideModal } from "./GUI.js";
import Evaluate from "./Evaluate.js";

import { 
    MODAL_HEIGHT, MODAL_WIDTH, 
    DEFAULT_HAND_SIZE, 
    DEFAULT_HP, BONUS_HP,
    BIG_NUMBER_FUNCTION, 
    CENTER_X, CENTER_Y,
    SCREEN_HEIGHT, SCREEN_WIDTH,
    CARD_HEIGHT, CARD_WIDTH,
    SLOT_SIZE_FACTOR,
    OFF_SCREEN_X, OFF_SCREEN_Y,
} from "./constants.js"; 


class Board extends Phaser.Scene
{
    preload ()
    {
        this.init();

        this.load.setBaseURL('assets');
        this.load.spritesheet('card_back', 'card_back.png', { frameWidth: CARD_WIDTH, frameHeight: CARD_HEIGHT});
        this.load.spritesheet('card_slot', 'card_slot.png', { frameWidth: CARD_WIDTH, frameHeight: CARD_HEIGHT});
        this.load.spritesheet('end_turn', 'end_turn.png', { frameWidth: CARD_WIDTH, frameHeight: CARD_HEIGHT});
        this.load.spritesheet('modal', 'modal.png', { frameWidth: MODAL_WIDTH, frameHeight: MODAL_HEIGHT});

        this.load.spritesheet('green_back', 'green_back.png', { frameWidth: CARD_WIDTH, frameHeight: CARD_HEIGHT});
        this.load.spritesheet('red_back', 'red_back.png', { frameWidth: CARD_WIDTH, frameHeight: CARD_HEIGHT});
        this.load.spritesheet('blue_back', 'blue_back.png', { frameWidth: CARD_WIDTH, frameHeight: CARD_HEIGHT});

    }

    init(){
        this.iteration = 0;
        this.big_number = BIG_NUMBER_FUNCTION(this.iteration);
        this.player_health = DEFAULT_HP+BONUS_HP;

        this.card_slots = this.add.group();
        this.hand = this.add.group();
        this.deck = this.add.group();
        this.discard = this.add.group();

        this.DraftCards = DraftCards.bind(this);
        this.createGUI = createGUI.bind(this);
        this.updateGUI = updateGUI.bind(this);
        this.setupModalForDraft = setupModalForDraft.bind(this);
        this.hideModal = hideModal.bind(this);
        this.Evaluate = Evaluate.bind(this);
    }

    create ()
    {
        this.createGUI();

        this.SetupBoard();

        this.CreateBaseDeck();

        this.Draw(DEFAULT_HAND_SIZE);

        this.displayHand();

        this.setupEventListeners();

        
    }

    update(t, dt){

        this.updateGUI();
    }

    displayHand(){

        let deck_start_x = 0.1*SCREEN_WIDTH;
        let deck_start_y = SCREEN_HEIGHT - CARD_HEIGHT*CARD_SCALE;
        let x_offset = CARD_WIDTH*CARD_SCALE+10;
        let i = 0;
        for (let card of this.hand.getChildren()){
            card.setPosition(deck_start_x+x_offset*i, deck_start_y);
            i++;
        }
    }

    SetupBoard(){
        const card_slot_positions = [
            [CENTER_X - CARD_WIDTH, 0.75*CENTER_Y],
            [CENTER_X, 0.75*CENTER_Y],
            [CENTER_X + CARD_WIDTH, 0.75*CENTER_Y]
        ];

        const equals_button_position = [CENTER_X + 2*CARD_WIDTH, 0.75*CENTER_Y];
        this.equals_button = new Card(this, equals_button_position[0], equals_button_position[1], '=', CARD_ABILITY.NONE);
        this.add.existing(this.equals_button);

        const end_turn_button_position = [0.9*SCREEN_WIDTH, 0.8*SCREEN_HEIGHT];
        this.end_turn_button = this.add.image(end_turn_button_position[0], end_turn_button_position[1], "end_turn");
        this.end_turn_button.setScale(CARD_SCALE);
        this.end_turn_button.setInteractive();

        const answer_position = [CENTER_X + 3*CARD_WIDTH, 0.75*CENTER_Y];
        this.answer = "";
        this.answer_image = this.add.image(answer_position[0], answer_position[1], 'card_slot');
        this.answer_image.setScale(1.5*CARD_SCALE*SLOT_SIZE_FACTOR, CARD_SCALE*SLOT_SIZE_FACTOR);
        this.answer_text = this.add.text(answer_position[0], answer_position[1], "", { fontFamily: 'Arial', fontSize: 128, color: '#ccc' });
        this.answer_text.setOrigin(0.5);

        const card_slot_types = [
            CARD_TYPES.NUMBER,
            CARD_TYPES.OPERATOR,
            CARD_TYPES.NUMBER,
        ]

        for(let i = 0; i < 3; i++){
            let position = card_slot_positions[i];
            let new_slot = this.add.image(position[0], position[1], 'card_slot');
            new_slot.accepts = card_slot_types[i];
            new_slot.card = null;
            new_slot.setScale(CARD_SCALE*SLOT_SIZE_FACTOR);
            this.card_slots.add(new_slot);
        }
    }

    setupEventListeners(){
        this.input.on('dragstart', function (pointer, gameObject)
        {
            this.children.bringToTop(gameObject);
            this.children.bringToTop(gameObject.card_text);

        }, this);

        this.input.on('drag', (pointer, gameObject, dragX, dragY) =>
        {
            gameObject.setPosition(dragX, dragY);

        });

        this.input.on('dragend', (pointer, gameObject) => {
            
            //if gameObject overlaps with any card slot
            let slot = this.overlapsWithSlot(gameObject);
            if (slot !== null){
                this.PlayCard(gameObject, slot);
            }

            this.displayHand();
        });

        this.equals_button.on('pointerup', ()=>{
            if(this.allSlotsFilled())
                this.Evaluate();
        });

        this.equals_button.on('pointerover', ()=>{

            if(this.allSlotsFilled())
                this.equals_button.setTexture('green_back');
            else{
                this.equals_button.setTexture('red_back');
            }
        });

        this.equals_button.on('pointerout', ()=>{
            this.equals_button.setTexture('card_back');
        });

        this.end_turn_button.on('pointerup', ()=>{
            this.EndTurn();
        });
    }

    PlayCard(card, slot){
        // remove from hand
        this.hand.remove(card);
        // add to slot
        slot.card = card;
        card.setPosition(slot.x, slot.y);
        card.disableInteractive();
    }

    overlapsWithSlot(card){
        var bottom_left = card.getBottomLeft();
        var bottom_right = card.getBottomRight();
        var top_left = card.getTopLeft();
        var top_right = card.getTopRight();

        for(let slot of this.card_slots.getChildren()){
            let bounds = slot.getBounds();

            // the slot must be valid for this card type and empty
            let isValid = slot.accepts === card.type && slot.card === null;

            // if its not a valid slot, don't bother performing bounds checking
            if (! isValid) continue; 

            // if the slot rectangle contains any corner of the card,
            // then the card is over the slot
            let isOverSlot =    bounds.contains(bottom_left.x, bottom_left.y) || 
                                bounds.contains(bottom_right.x, bottom_right.y) || 
                                bounds.contains(top_left.x, top_left.y) || 
                                bounds.contains(top_right.x, top_right.y);

            // we know its valid by this point, but invoking it again
            // here is just to make it more explicit
            if (isValid && isOverSlot){
                return slot;
            }
        }

        return null;
    }

    allSlotsFilled(){
        for(let slot of this.card_slots.getChildren()){
            if (slot.card === null){
                return false;
            }
        }

        return true;
    }

    
    DamagePlayer(amount){
        this.player_health -= amount;

        if(this.player_health <= 0){
            this.player_health = 0;
            //TODO: Game Over
        }
    }
        

    Discard(card){
        card.setPosition(OFF_SCREEN_X, OFF_SCREEN_Y);
        this.discard.add(card);
    }

    DiscardHand(){
        for(let card of this.hand.getChildren()){
            card.setPosition(OFF_SCREEN_X, OFF_SCREEN_Y);
            this.discard.add(card);
        }

        this.hand.clear();
    }

    RefreshDeck(){
        if(this.discard.getChildren().length > 0){
            for(let card of this.discard.getChildren()){
                this.deck.add(card);
            }

            this.discard.clear();
        }
    }

    Draw(number){

        if (number > this.deck.getChildren().length ){

            this.RefreshDeck();

            if (number > this.deck.getChildren().length ){
                number = this.deck.getChildren().length;
            }
            
        }

        for(let i=0;i<number;i++){

            let drawn_card = Phaser.Math.RND.pick(this.deck.getChildren());
            this.deck.remove(drawn_card);
            this.hand.add(drawn_card);
            drawn_card.setInteractive();
            
        }

        this.displayHand();
        
    }

    CreateBaseDeck(){


        for(let i=1; i<5;i++){
            let new_card = new Card(this, 0, 0, i, CARD_ABILITY.NONE);
            this.add.existing(new_card);
            this.AddCardToDeck(new_card);
        }

        for(let i=1; i<5;i++){
            let new_card = new Card(this, 0, 0, i, CARD_ABILITY.NONE);
            this.add.existing(new_card);
            this.AddCardToDeck(new_card);
        }

        let operators = ['+', '-', 'x', '/'];
        for (let o of operators){
            let new_card = new Card(this, 0, 0, o, CARD_ABILITY.NONE);
            this.add.existing(new_card);
            this.AddCardToDeck(new_card);
        }
    }

    AddCardToDeck(card){
        card.setPosition(OFF_SCREEN_X, OFF_SCREEN_Y);
        this.deck.add(card);
        this.input.setDraggable(card);
    }

    Draft(){
        
        this.setupModalForDraft();
        this.modal.setVisible(true);
    }

    StartNewRound(){
        this.DiscardHand();
        this.Draw(DEFAULT_HAND_SIZE);
    }

    EndTurn(){
        
        this.DamagePlayer(10);
        this.DiscardHand();
        this.Draw(DEFAULT_HAND_SIZE);
    }

    print_once(message){
        if(this.has_printed){
            return;
        }

        console.log(message);
        this.has_printed = true;
    }
}

var config = {
    type: Phaser.AUTO,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    parent: "container",
    scene: Board,
    backgroundColor: "#222",
    physics:{
        default: "arcade",
        arcade: {
            debug: true
        }
    }
};

var game = new Phaser.Game(config);
