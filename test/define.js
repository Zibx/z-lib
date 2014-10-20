/**
 * Created by Ivan on 10/20/2014.
 */

var vows = require('vows'),
    assert = require('assert');

var Z = require('../lib/z');

vows.describe('define classes').addBatch({
    'define cat': {
        topic: function(){
            Z.define('cat', {
                ctor: function(  ){
                    this.canMeow = true;
                },
                meow: function(){
                    return 'meow';
                }
            }, this.callback);
        },
        'can instantiate?': function( animal, topic ){
            assert.isObject(new animal());
        },
        'is a animal?': function( animal, topic ){
            assert((new animal()).className === 'cat');
        },
        'can meow?': function( animal, topic ){
            assert.isTrue((new animal()).canMeow);
            assert((new animal()).meow() === 'meow');
        },
        'meowing?': function( animal, topic ){
            assert.isTrue((new animal()).canMeow);
            assert((new animal()).meow() === 'meow');
        }

    },
    'define leopard': {
        topic: function(  ){
            Z.define('leopard', {
                implement: ['cat'],
                fast: true
            }, this.callback);
        },
        'can instantiate?': function( animal, topic ){
            assert.isObject(new animal());
        },
        'is a animal?': function( animal, topic ){
            assert((new animal()).className === 'leopard');
        },
        'can meow?': function( animal, topic ){
            assert.isTrue((new animal()).canMeow);
        },
        'meowing?': function( animal, topic ){
            assert((new animal()).meow() === 'meow');
        }
    },
    'define gepard': {
        topic: function(  ){
            Z.define('gepard', {
                implement: ['cat','leopard'],
                ctor: function(  ){
                    this.canMeow = false;
                }
            }, this.callback);
        },
        'can instantiate?': function( animal, topic ){
            assert.isObject(new animal());
        },
        'is a animal?': function( animal, topic ){
            assert((new animal()).className === 'gepard');
        },
        'can meow?': function( animal, topic ){
            assert.isFalse((new animal()).canMeow);
        },
        'meowing?': function( animal, topic ){
            assert((new animal()).meow() === 'meow');
        },
        'is cat?': function( animal, topic ){
            assert(Z.is(new animal(), 'cat'));
        },
        'is gepard?': function( animal, topic ){
            assert(Z.is(new animal(), 'gepard'));
        },
        'is leopard?': function( animal, topic ){
            assert(Z.is(new animal(), 'leopard'));
        },
        'is trololo?': function( animal, topic ){
            assert.isFalse(Z.is(new animal(), 'trololo'));
        }
    },
    'maybe corrupted by inherit': {
        topic: function(  ){
            Z.use(['gepard','cat','leopard'], function( gepard, cat, leo ){
                this.callback(gepard, cat, leo);
            }.bind(this))
        },
        'create cat': function( g, c, l, topic ){
            assert((new c()).className === 'cat');
        },
        'create gepard': function( g, c, l,  topic ){
            assert((new g()).className === 'gepard');
        },
        'cat meowing': function( g, c, l,  topic ){
            assert.isTrue((new c()).canMeow);
        },
        'gepard meowing': function( g, c, l,  topic ){
            assert.isFalse((new g()).canMeow);
        },
        'speed check': function( g,c,l,t ){
            var d = +new Date();
            for( var i = 0; i < 50000; i++ )
                var mur = new g();
            assert(+new Date() - d < 25)
        },
        'applying': function( g,c,l,t ){
            var g = new g({tro: 'lolo'});
            assert( g.tro==='lolo');
        },
        'is cat?': function( g,c,l,t ){
            assert(Z.is(new c(), 'cat'));
        },
        'is gepard?': function( g,c,l,t ){
            assert.isFalse(Z.is(new c(), 'gepard'));
        }
    }
} ).exportTo(module);
