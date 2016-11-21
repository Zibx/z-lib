/**
 * Created by Zibx on 10/14/2014.
 */(function(  ){
    'use strict';

        var applyDeep,
        toString = Object.prototype.toString,
        getType = function( obj ){
            return toString.call( obj );
        },
        slice = Array.prototype.slice,
        concat = Array.prototype.concat,
        parseFloat = this.parseFloat,

        _delayList = [],
        _delay,
        _delayFn = function(  ){
            _delay = false;
            var i, _i, data;
            for( i = 0, _i = _delayList.length; i < _i; i++ ){
                data = _delayList[i];
                delete data.fn.__delayed;
                delete data.scope.__delayed;
                data.fn.apply( data.scope, data.args || [] );
            }
        },
        bind = Function.prototype.bind;

    this.Math.sgn = function( num ){
        return num >= 0 ? 1 : -1;
    };

    var Z = {
        _cls: {},
        is: function( obj, name ){
            return obj._is && !!obj._is[name];
        },
        define: function( name, cfg, fn ){
            var waiter = Z.classWaiter || (Z.classWaiter = Z.wait());
            waiter.add();


            var Ctor = function(cfg){
                    var i = 0,
                        ctors = this._ctors,
                        _i = ctors.length,
                        fns = this._is,
                        fn;
                    Z.apply(this, cfg);
                    for( ;i<_i;i++ )
                        (fn = fns[ctors[i]]) &&
                            (fn = fn.ctor) &&
                                fn.call(this, cfg);
                },
                proto = Ctor.prototype = cfg,
                _is = proto._is = {},
                _ctors = proto._ctors = [],
                implement = cfg.implement || [];
            proto._is[name] = proto;
            proto.className = name;

            waiter.act(implement, function(){
                implement.forEach( function( name ){
                    var implementProto = Z._cls[name].prototype,
                        implement_ctors = implementProto._ctors,
                        i, _i, item;
                    Z.applyBut(proto, implementProto, ['_is', 'className', 'ctor','_ctors']);

                    for( i = 0, _i = implement_ctors.length; i < _i; i++ )
                        !_is[ item = implement_ctors[ i ] ] && _ctors.push(item);



                    Z.apply(_is, implementProto._is);
                });
                cfg.ctor && _ctors.push( name );
                proto._ctors = _ctors = concat.apply([], _ctors);
                Z._cls[name] = Ctor;
                waiter.done(1, name);

            });
            fn && Z.use(name, fn);
            return Ctor;
        },
        use: function( name, fn ){
            var waiter = Z.classWaiter || (Z.classWaiter = Z.wait());
            name = Z.makeArray(name);
            waiter.act( name, function(  ){
                fn.apply( null, name.map( function( name ){
                    return Z._cls[name];
                } ) )
            } );
        },
        extend: function( obj1, obj2 ){
            if( typeof obj1 === 'function' )
                return Z.apply( new obj1, obj2 );

            var f = function(){};
            f.prototype = obj1;
            return Z.apply( new f(), obj2 );
        },
        bind: function( scope, fn ){
            var subFn = scope[ fn ];
            return bind.apply( subFn, [].concat.apply( [scope],Z.toArray( arguments ).slice(2) ) );
            //return subFn.bind.apply( subFn, [].concat.apply( [scope],Z.toArray( arguments ).slice(2) ) );
        },
        /* take array of values. find exact match el of el that value is before searched one. It's binary search*/
        findBefore: function( arr, el ){
            return arr[ Z.findIndexBefore( arr, el ) ];
        },

        // binary search
        findIndexBefore: function( arr, el ){
            var l1 = 0,
                delta = arr.length,
                floor = Math.floor,
                place;
            while( delta > 1 ){
                delta = delta / 2;
                if( arr[floor(l1 + delta)] > el ){
                }else{
                    l1 += delta
                }
            }
            place = floor(l1+delta)-1;
            return place;
        },
        interval: function( from, to, step ){
            var out = [];
            step = Math.abs( step ) || 1;
            if( to < from )
                for( ;from >= to; from -= step )
                    out.push( from );
            else
                for( ;from <= to; from += step )
                    out.push( from );
            return out;
        },
        repeat: function( n, fn, scope ){
            var out = [];
            for( var i = 0; i < n; i++ )
                out.push( fn.call( scope, i, n ) );
            return out;
        },
        parseFloat: function(a){
            return parseFloat(a) || undefined;
        },
        getProperty: function( prop ){
            return function(a){
                return a[ prop ];
            }
        },
        getArgument: function( n ){
            return function(){
                return arguments[ n ];
            }
        },
        or: function(prop){
            return function(a){
                return a || prop;
            }
        },
        getPropertyThroughGet: function( prop ){
            return function(a){
                return a.get( prop );
            }
        },
        sort: {
            number: function( a, b ){
                return a - b;
            },
            numberReverse: function( a, b ){
                return b - a;
            },
            numberByProperty: function( name ){
                return function( a, b ){
                    return a[ name ] - b[ name ];
                }
            },
            stringByProperty: function( name ){
                return function( a, b ){
                    var aKey = a[ name ], bKey = b[ name ];
                    return aKey > bKey ? 1 : aKey < bKey ? -1 : 0;
                }
            }
        },
        checkthisPropertyExist: function (name) {
            return this.checkPropertyExist(name, this);
        },
        checkPropertyExist: function (name, obj) {
            var arr = name.split('.');

            for (var i = 0, l = arr.length; i < l; i++) {
                if (!obj[arr[i]])
                    return false;
                obj = obj[arr[i]];
            }

            return obj;
        },
        mapFn: {
            toUpperCase: function(a){
                return (a || '').toUpperCase();
            }
        },
        reduceFn: {
            min: function( a, b ){
                return a != null ? ( b != null  ? Math.min( a, b ) : a ) : b;
            },
            max: function( a, b ){
                return a != null ? ( b != null ? Math.max( a, b ) : a ) : b;
            },
            sum: function( a, b ){
                return a - (-b);
            },
            diff: function( a, b ){
                return b - a;
            },
            push: function( a ){
                this.push( a );
            },
            concat: function( a, b ){
                return a.concat( b );
            }
        },
        filter: (function(){
            var filterFn = function(fn, out){
                return function(){
                    var data = fn.apply(this, Z.toArray(arguments));
                    if( data !== void 0 )
                        out.push( data );
                }
            };
            return function( arr, fn ){
                var out = [];
                Z.each( arr, filterFn(fn, out) );
                return out;
            }
        })(),
        objectDiff: function (old, newOne, emptyValue, similarValues, deep) {
            var getType = Z.getType,

                hash = {},
                diff = {},
                i, j,
                val1, val2,
                type1, type2,
                differences = false;

            similarValues = Z.arrayToObj(similarValues || []);


            deep = deep === void 0 ? true : deep;

            for( i in old )
                old.hasOwnProperty( i ) &&
                    ( hash[ i ] = old[i] );

            for( i in newOne )
                newOne.hasOwnProperty( i ) &&
                    ( hash[ i ] === void 0 && newOne[ i ] !== void 0 ) &&
                    ( differences = true ) &&
                ( diff[i] = newOne[ i ] );

            for( i in hash )
                if( hash.hasOwnProperty( i ) ){
                    if( ( val1 = hash[i] ) === ( val2 = newOne[i] ) )
                        continue;

                    if( ( similarValues[ val1 ] === true ) === similarValues[ val2 ] )
                        continue;

                    if( val2 === void 0 ){
                        ( differences = true ) && (diff[i] = emptyValue );
                        continue;
                    }

                    if( ( type1 = getType(val1) ) !== ( type2 = getType(val2) ) ){
                        ( differences = true ) && ( diff[i] = val2 );
                        continue;
                    }

                    // here elements have the same type
                    if( type1 === '[object Array]' ){
                        if( (j = val1.length ) !== val2.length ){
                            ( differences = true ) && ( diff[i] = val2 );
                            continue
                        }

                        for( ;j; ){
                            --j;
                            if( val1[ j ] !== val2[ j ] ){
                                ( differences = true ) && ( diff[i] = val2 );
                                continue;
                            }
                        }
                    }else if( type1 === '[object Object]' ){
                        if (deep === true)
                            if (Z.objectDiff(val1, val2, emptyValue, similarValues, deep) !== false)
                                ( differences = true ) && ( diff[i] = val2 );
                    }else{
                        ( differences = true ) && ( diff[i] = val2 );
                    }


                }

            return differences ? diff : false;
        },
        pipe: function(){
            var args = Z.toArray(arguments);
            return function(){
                var out = Z.toArray(arguments);
                for( var i = 0, _i = args.length; i < _i; i++)
                    out = [args[i].apply( this, out )];
                return out[0];
            }
        },
        /*
         Function: doAfter

         Takes lots of functions and executes them with a callback function in parameter. After all callbacks were called it executes last function

         */
        doAfter: function(){
            var i = 0,
                _i = arguments.length - 1,
                counter = _i,
                callback = arguments[ _i ],
                data = {};

            for( ; i < _i; i++ ){
                (function( callFn, i ){
                    var fn = function(){
                        data[ i ] = arguments;

                        if( fn.store != null )
                            data[ fn.store ] = arguments;

                        if( !--counter )
                            callback( data );

                    };

                    callFn( fn )
                })( arguments[i], i );
            }
        },
        zipObject: function( arr1, arr2 ){
            var out = {};
            arr1.forEach(function( el, i ){
                out[el] = arr2[i];
            } );
            return out;
        },
        emptyFn: function(){},
        /*
         proxy config
         {
         fromKey: toKey        = rename
         fromKey: !toValue     = delete property if toKey === value
         !fromKey: toValue     = add value to fromKey if it's not exists
         }
         */
        proxy: function( proxy, obj ){
            var newObj = Z.clone( obj );
            Z.each( proxy, function( key, val ){

                if( val && val.charAt(0) == '!' ){
                    if( obj[ key ] == val.substr( 1 ) )
                        delete newObj[ key ];
                }else if( key.charAt(0) == '!' && newObj[ key.substr( 1 ) ] === undefined ){
                    newObj[ key.substr( 1 ) ] = val;
                }else{
                    if( obj[ key ] && val )
                        newObj[ val ] = obj[ key ];
                    delete newObj[ key ];
                }
            });
            return newObj;
        },
        clone: function( obj, deep ){
            var out, i, cloneDeep = deep != null;
            switch( getType( obj ) ){
                case '[object Array]':
                    out = [];
                    if( cloneDeep )
                        for( i = obj.length; i; ){
                            --i;
                            out[ i ] = Z.clone( obj[ i ], true );
                        }
                    else
                        for( i = obj.length; i; ){
                            --i;
                            out[ i ] = obj[ i ];
                        }
                    return out;
                case '[object Object]':
                    out = {};
                    if( cloneDeep )
                        for( i in obj )
                            out[ i ] = Z.clone( obj[ i ], true );
                    else
                        for( i in obj )
                            out[ i ] = obj[ i ];


                    return out;
            }
            return obj;
        },
        applyIfNot: function( el1, el2 ){
            var i, undefined = void 0;

            for( i in el2 )
                el1[ i ] === undefined && ( el1[ i ] = el2[ i ] );

            return el1;
        },
        /*
         Function: apply

         Applies el2 on el1. Not recursivly

         Parameters:
         el1 - object to apply on
         el2 - applieble object

         Return:
         el1

         See also:
         <Z.applyLots> <Z.applyDeep>
         */
        apply: function( el1, el2 ){
            var i;

            for( i in el2 )
                el1[ i ] = el2[ i ];

            return el1;
        },
        applyBut: function( el1, el2, but ){
            but = Z.a2o(but);
            var i;

            for( i in el2 )
                !but[i] && (el1[ i ] = el2[ i ]);

            return el1;
        },
        /*
         Function: slice

         Array.prototype.slice usually useful to convert arguments to Array

         Parameters:
         args - Array || arguments
         start - start position
         length - count of items

         Return:
         array

         Example:
         (code)
         (function (){
         return Z.slice.call( arguments, 1 );
         })(1,2,3,4,5)
         // Output:
         //   [2,3,4,5]
         (end code)
         */
        slice: slice,

        toArray: function( obj ){
            return slice.call( obj );
        },
        /*
         Function: applyLots
         Apply more then one objects

         Parameters:
         el1 - object to apply on
         args[ 1-inf ] - applieble objects

         Return:
         el1

         See also:
         <Z.apply> <Z.applyDeep>
         */
        applyLots: function( el1 ){
            var i, j, el2, applyL = arguments.length;
            for( j = 1; j < applyL; j++ ){
                el2 = arguments[ j ];
                for( i in el2 )
                    el1[ i ] = el2[ i ];
            }
            return el1;
        },

        /*
         Function: applyDeep
         Recursivly aplly el2 on el1. Work propper only with objects. Was designed to apply plugins.

         Parameters:
         el1 - object to apply on
         el2 - applieble object

         Return:
         el1

         See also:
         <Z.apply> <Z.applyLots>
         */
        applyDeep: function(a,b){
            var me = applyDeep,
                i, el;

            for( i in b ){
                el = a[ i ];
                if( el && typeof el === 'object' ){
                    me( el,  b[ i ] );
                }else
                    a[ i ] = b[ i ];
            }
            return a;
        },

        /*
         Function: isArray
         Test is argument an Array

         Parameters:
         obj - object

         Return:
         bool - true if array, false if not

         */
        isArray: function( obj ){
            return getType( obj ) === '[object Array]';
        },

        /*
         Function: each
         Itterate Objects && Arrays.

         Object gets:
         key  - key
         value  - value

         this  - element

         Array gets:
         value  - value
         i  - index of element in array

         this  - element


         Parameters:
         el - Object || Array
         callback - function which would be called with each item

         See also:
         <eachReverse>
         */
        each: function( el, callback ){
            var i, _i, out;

            if( el === null || el === undefined )
                return false;

            if( Z.isArray( el ) ){
                for( i = 0, _i = el.length; i < _i; i++ ){
                    out = callback.call( el[i], el[i], i );
                    if( out !== undefined )
                        return out;
                }
            }else{
                for( i in el )
                    if( el.hasOwnProperty( i ) ){
                        out = callback.call( el[i], i, el[i] );
                        if( out !== undefined )
                            return out;
                    }

            }
        },
        /*
         Function: eachReverse
         Itterate Objects && Arrays in reverse order.

         Object gets:
         key  - key
         value  - value

         this  - element

         Array gets:
         value  - value
         i  - index of element in array

         this  - element


         Parameters:
         el - Object || Array
         callback - function which would be called with each item

         See also:
         <each>
         */
        eachReverse: function( el, callback ){
            var i, _i, item;

            if( el === null || el === undefined )
                return false;

            if( Z.isArray( el ) ){
                for( i = el.length; i; ){
                    --i;
                    callback.call( el[i], el[i], i );
                }
            }else{
                _i = [];
                for( i in el ){
                    if( el.hasOwnProperty( i ) )
                        _i.push( [ i, el[i] ] )
                }
                for( i = _i.length; i; ){
                    item = _i[ --i ];
                    callback.call( item[1], item[0], item[1] );
                }

            }
        },
        /*
         Function: makeArray
         wraps single element with Array if not

         Parameters:
         el - Element

         Return:
         Array
         */
        makeArray: function( obj ){
            return obj !== void 0 ? ( this.isArray( obj ) ? obj : [ obj ] ) : [];
        },
        /*
         Function: arrayRotate
         Lets imagine an array as a looped object, where after last element goes the first one.

         Parameters:
         arr - Array
         val - offset of rotation

         Return:
         Array

         Example:
         Z.arrayRotate([1,2,3,4,5],2) => (3,4,5,1,2)
         */
        arrayRotate: function( arr, i ){
            return arr.slice(i).concat(arr.slice(0,i));
        },
        /*
         Function: arrayToObj
         Convert Array to hash Object

         Parameters:
         arr - Array
         val [optional] - value that would be setted to each member (default is _true_)

         Return:
         Hash object
         */
        arrayToObj: function( arr, val ){
            var i = 0, _i = arr.length,
                newVal = val || true,
                out = {};
            if( arr === null || arr === undefined ) return out;

            for( ; i < _i; i++ ){
                out[ arr[ i ] ] = newVal;
            }
            return out;
        },
        makeHash: function( arr, hash, hashVal ){
            var out = {}, i, item, tmp;
            if( typeof hashVal === 'function' )
                if( typeof hash === 'function' ){
                    for( i = arr.length; i; ){
                        item = arr[ --i ];
                        tmp = hash( item );
                        out[ tmp ] = hashVal( item, out[tmp] );
                    }
                }else{
                    for( i = arr.length; i; ){
                        item = arr[ --i ];
                        tmp = item[ hash ];
                        out[ tmp ] = hashVal( item, out[ tmp ] );
                    }
                }
            else
                if( typeof hash === 'function' ){
                    for( i = arr.length; i; ){
                        item = arr[ --i ];
                        out[ hash( item ) ] = item;
                    }
                }else{
                    for( i = arr.length; i; ){
                        item = arr[ --i ];
                        out[ item[ hash ] ] = item;
                    }
                }
            return out;
        },
        map: function(el, f){
            var out = [],
                toArray = Z.toArray;
            Z.each(el, function(){
                out.push( f.apply( this, toArray(arguments) ) );
            });
            return out;
        },
        isEmpty: function( obj ){
            var undefined = void 0;
            if( getType( obj ) === '[object Object]' )
                for( var i in obj ){
                    if( obj.hasOwnProperty(i) && obj[i] !== undefined )
                        return false
                }
            return true;
        },
        allArgumentsToArray: function(args){
            return Array.prototype.concat.apply([],Z.toArray(args).map( Z.makeArray.bind(Z) ));
        },
        wait: (function(  ){
            var Zhdulia = function( fn ){
                this.counter = 0;
                this.fn = [];
                this.after(fn);
                this._actions = {};
            };
            Zhdulia.prototype = {
                after: function( fn ){
                    this.fn.push(fn);
                    this.finished && this._try();
                    this._actions = {};
                    this._waiters = {};
                },
                act: function( obj, after ){
                    var actions = this._actions,
                        _self = this;
                    var W = new Zhdulia( function(  ){
                        after();
                    } );
                    Z.each( obj, function( name, fn ){

                        if( actions[ name ] === void 0 ){
                            W.add();
                            actions[ name ] = false;
                            if( fn ){
                                _self.add();
                                fn( function(){
                                    actions[name] = true;
                                    _self.done( 1, name );
                                } );
                            }
                            (_self._waiters[name] = _self._waiters[name] || []).push(W);
                        }else if( actions[ name ] === false ){
                            W.add();
                            (_self._waiters[name] = _self._waiters[name] || []).push(W);
                        }
                    } );
                    W.done(0);

                },
                add: function( count ){
                    this.counter += count === void 0 ? 1 : count;
                },
                _try: function(  ){
                    if( this.finished || (this.counter === 0 && this.fn.length) ){

                        this.finished = true;
                        var fns = this.fn, fn, i = 0, _i = fns.length;
                        for(;i<_i; i++)
                            (fn = fns[i]) && typeof fn === 'function' && fn();
                    }
                },
                done: function( count, name ){
                    if(typeof name === 'string'){
                        this._actions[name] = true;
                        var el;
                        if(this._waiters[name])
                            while( el = this._waiters[name].pop() )
                                el.done();
                    }
                    this.counter -= count === void 0 ? 1 : count;
                    this.counter === 0 && setImmediate(this._try.bind(this));
                }
            };
            return function( fn ){
                return new Zhdulia( fn );
            };
        })()
    };
    Z.a2o = Z.arrayToObj;
    module && (module.exports = Z);
}).call(
    // get eval from its nest
    (1,eval)('this')
);
