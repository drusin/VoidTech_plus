import { Scene } from 'phaser';

import mapJson from './assets/ship2.json';
import tiles from './assets/Tileset.png';
import player_acting from './assets/Dave acting.png'
import door from './assets/door.png'

import { PLAYER_TILESET_KEY } from './entities/player.js';
import Player from './entities/player.js';
import { DialogPlugin } from './plugins/dialog.js';

import dialog from './dialog/dialog.js';

import stateMachine from './stateMachine.js';

export default class GameScene extends Scene {
	constructor() {
		super({ key: GameScene.KEY });
		this.playerCollider = null;
	}
	
	static get KEY() {
		return 'game-scene'
	}

	preload() {
		this.load.image('tiles', tiles);
		this.load.tilemapTiledJSON('map', mapJson);
		this.load.spritesheet(PLAYER_TILESET_KEY,
			player_acting,
			{ frameWidth: 32, frameHeight: 32 }
		);
		this.load.spritesheet('door',
			door,
			{ frameWidth: 16, frameHeight: 16 }
		);
		this.load.scenePlugin('Dialog', DialogPlugin);
	}

	initializeObjects(tilemap) {
		this.speechTriggers = this.physics.add.group();
		this.levers = this.physics.add.group();

		tilemap.getObjectLayer('objects').objects.forEach(obj => {
			const sprite = this.physics.add.sprite(obj.x, obj.y, null);
			sprite.setDisplaySize(obj.width, obj.height);
			sprite.setOrigin(0, 0);
			sprite.depth = -10;

			// copy custom properties
			obj.properties.forEach(prop => {
				sprite.setData(prop.name, prop.value);
			})

			if (obj.name === "trigger") {
				this.speechTriggers.add(sprite);
			}
			else if (obj.name === "lever") {
				this.levers.add(sprite);
			}
		});
	}
	
	create() {
		this.physics.world.TILE_BIAS = 8;
		this.physics.world.OVERLAP_BIAS = 1; // we don't want to automatically resolve overlaps
		
		const map = this.make.tilemap({ key: 'map' });
		const tileset = map.addTilesetImage('Tileset', 'tiles');
		const doorTileset = map.addTilesetImage('door');
		const walkableLayer = map.createStaticLayer('floor', tileset, 0, 0);
		const wallLayer = map.createStaticLayer('walls', tileset, 0, 0);
		wallLayer.setCollisionBetween(1, 999);
		this.doorLayer = map.createDynamicLayer('doors', doorTileset, 0, 0);
		this.doorLayer.setCollisionByProperty({ collision: true });


		
		this.player = new Player(this);
		this.physics.add.collider(this.player.sprite, wallLayer);
		this.physics.add.collider(this.player.sprite, this.doorLayer);

		this.initializeObjects(map);

		dialog.init(this.Dialog, this, this.player);

		stateMachine.init(this.player);
	}

	update(time, delta) {
		stateMachine.update();
		this.player.update();
	}
}