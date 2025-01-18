

import { 
    BIG_FONT, MID_FONT, SMALL_FONT,
    CENTER_X, CENTER_Y,
    SCREEN_HEIGHT, SCREEN_WIDTH,
    TEXT_SCROLL_SPEED,
    MODAL_HEIGHT, MODAL_WIDTH,
    CARD_WIDTH
} from "./constants.js"; 

export function createGUI(){
    
    this.big_number_display = this.add.text(CENTER_X, 0.1*SCREEN_HEIGHT, `${this.big_number}`, { fontFamily: 'Arial', fontSize: BIG_FONT, color: '#ff0000' });
    this.big_number_display.setOrigin(0.5);

    this.deck_display = this.add.text(0, 0, `Deck: 0`, { fontFamily: 'Arial', fontSize: SMALL_FONT, color: '#fff' });
    this.discard_display = this.add.text(0, 35, `Discard: 0`, { fontFamily: 'Arial', fontSize: SMALL_FONT, color: '#fff' });
    this.iteration_display = this.add.text(0, 70, `Numbers defeated: 0`, { fontFamily: 'Arial', fontSize: SMALL_FONT, color: '#fff' });
    this.player_health_display = this.add.text(0, 105, `HP: ${this.player_health}`, { fontFamily: 'Arial', fontSize: SMALL_FONT, color: '#fff' });
    this.big_number_stunned_display = this.add.text(0, 140, `BigNumber stunned: ${this.big_number_stunned}`, { fontFamily: 'Arial', fontSize: SMALL_FONT, color: '#fff' });

    this.modal = this.add.image(CENTER_X, CENTER_Y, 'modal');
    this.modal.setVisible(false);
}

export function updateGUI(){
    if (this.answer_text.y < 0){
        this.answer_text.setPosition(this.answer_image.x, this.answer_image.y);
        this.answer_text.setText("");
    }
    else if(this.answer_text.text !== ""){
        this.answer_text.y -= TEXT_SCROLL_SPEED;
    }
    
    if (!Number.isInteger(this.big_number)){
        this.big_number_display.setText(this.big_number.toFixed(2));
    }
    else{
        this.big_number_display.setText(this.big_number);
    }

    this.iteration_display.setText(`Numbers defeated: ${this.iteration}`);
    

    this.deck_display.setText(`Deck: ${this.deck.getLength()}`);
    this.discard_display.setText(`Discard: ${this.discard.getLength()}`);

    this.player_health_display.setText(`HP: ${this.player_health}`);
    this.big_number_stunned_display.setText(`BigNumber stunned: ${this.big_number_stunned} (Threshold: ${this.big_number_stun_threshold})`);
}

export function setupModalForDraft(){
    this.children.bringToTop(this.modal);

    const header_position_x = this.modal.x;
    const header_position_y = this.modal.y - 0.4*MODAL_HEIGHT;

    const footer_position_x = this.modal.x;
    const footer_position_y = this.modal.y + 0.4*MODAL_HEIGHT;

    this.modal.header = this.add.text(header_position_x, header_position_y, "You Defeated The Number!", { fontFamily: 'Arial', fontSize: MID_FONT, color: '#ffff00' });
    this.modal.header.setOrigin(0.5);

    this.modal.footer = this.add.text(footer_position_x, footer_position_y, "Choose a card to add to your deck.", { fontFamily: 'Arial', fontSize: SMALL_FONT, color: '#fff' });
    this.modal.footer.setOrigin(0.5);

    this.card_options = this.DraftCards();

    let i = 0
    for(let card of this.card_options){
        card.setPosition(CENTER_X+CARD_WIDTH*(i++-1), CENTER_Y);
        this.children.bringToTop(card);
        this.children.bringToTop(card.card_text);

        card.once('pointerup', (args) => {

            // create clone and add it to scene and player deck
            let card_clone = card.clone();
            this.add.existing(card_clone);
            this.AddCardToDeck(card_clone);

            // destroy all displayed cards
            this.card_options.forEach( (card, i)=> {
                card.card_text.destroy();
                card.destroy();
            });

            this.card_options = [];
            this.hideModal();

        });
    }
}

export function setupModalForGameOver(){
    this.children.bringToTop(this.modal);

    const header_position_x = this.modal.x;
    const header_position_y = this.modal.y - 0.3*MODAL_HEIGHT;

    const footer_position_x = this.modal.x;
    const footer_position_y = this.modal.y+0.3*MODAL_HEIGHT;

    this.modal.header = this.add.text(header_position_x, header_position_y, "Game Over!", { fontFamily: 'Arial', fontSize: BIG_FONT, color: '#ff0000' });
    this.modal.header.setOrigin(0.5);

    this.modal.footer = this.add.image(footer_position_x, footer_position_y, 'new_game');
    this.modal.footer.setInteractive();
    this.modal.footer.setOrigin(0.5);

    this.modal.stats = this.add.text(this.modal.x, this.modal.y, `Numbers defeated: ${this.iteration}`, { fontFamily: 'Arial', fontSize: SMALL_FONT, color: '#ffffff' })

    this.modal.footer.once('pointerup', (args) => {
        this.DestroyAllGameObjects();
        this.StartNewGame();
        this.hideModal();
    });
}

export function hideModal(){
    this.modal.setVisible(false);
    this.modal.header.destroy();
    this.modal.footer.destroy();
}
