export const CARD_SCALE = 0.6;

export const CARD_TYPES = Object.freeze({
    NUMBER: 0,
    OPERATOR: 1,
    FUNCTION: 2
});

export const OPERATIONS = Object.freeze({
    '+': (a, b) => a+b,
    '-': (a, b) => a-b,
    '/': (a, b) => a/b,
    'x': (a, b) => a*b,
})

export class Card extends Phaser.GameObjects.Image
{
    constructor (scene, x, y, value, frame)
    {
        super(scene, x, y, 'card_back', frame);
        this.value = value;

        var is_number = !isNaN(parseFloat(value));

        if (is_number)
            this.type = CARD_TYPES.NUMBER;
        else{
            this.type = CARD_TYPES.OPERATOR;
        }
        
    }

    addedToScene ()
    {
        super.addedToScene();        
        this.card_text = this.scene.add.text(this.x, this.y, `${this.value}`, { fontFamily: 'Arial', fontSize: 128, color: '#ccc' });
        this.card_text.setOrigin(0.5);
        this.setScale(CARD_SCALE);
        this.setInteractive();
    }

    removedFromScene ()
    {
        super.removedFromScene();

    }

    setPosition(x, y){

        super.setPosition(x, y);

        if (this.card_text){
            this.card_text.setPosition(this.x, this.y);
        }

    }

    getNumber(){
        return parseFloat(this.value);
    }

    getOperation(){
        return OPERATIONS[this.value];
    }
}