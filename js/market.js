/**
 * Market object
 */
var market = {
    'bid': new Map(), //bid orders
    'cachedSortedNonEmptyBid': [],
    'cachedBidSize': 0,

    'ask': new Map(), //ask orders
    'cachedSortedNonEmptyAsk': [],
    'cachedAskSize': 0,

    // update cache by cache type
    'updateCacheByType': function(type) {
        type == 'bid' ? this.updateBidCache() : this.updateAskCache();
    },

    // update cache for Bid positions
    'updateBidCache': function() {
        let arrKeys = [];
        let bidSize = 0;
        this.bid.forEach((value, key) => {
            if (value > 0) {
                arrKeys.push(key);
                bidSize += value;
            }
        });
        if (arrKeys.length > 0) {
            this.cachedSortedNonEmptyBid = arrKeys.sort((a,b) => (b - a));
            this.cachedBidSize = bidSize;
        } else {
            this.cachedSortedNonEmptyBid = [];
            this.cachedBidSize = 0;
        }
    },

    // update cache for Ask positions
    'updateAskCache': function() {
        let arrKeys = [];
        let askSize = 0;
        this.ask.forEach((value, key) => {
            if (value > 0) {
                arrKeys.push(key);
                askSize += value;
            }
        });
        if (arrKeys.length > 0) {
            this.cachedSortedNonEmptyAsk = arrKeys.sort((a,b) => (a - b));
            this.cachedAskSize = askSize;
        } else {
            this.cachedSortedNonEmptyAsk = [];
            this.cachedAskSize = 0;
        }
    },
  
    // update order size by price in selected market
    'updateOrder': function(type, price, size) {
        this[type].set(price, size);
        this.updateCacheByType(type);
    },
  
    // get best non-empty bid price
    'getBestBid': function() {
        if (this.cachedSortedNonEmptyBid.length > 0) {
            return this.cachedSortedNonEmptyBid[0];
        }
        throw "There is no Best Bid at all."
    },
  
    // get best non-empty ask price
    'getBestAsk': function() {
        if (this.cachedSortedNonEmptyAsk.length > 0) {
            return this.cachedSortedNonEmptyAsk[0];
        }
        throw "There is no Best Ask at all."
    },
  
    // query to get size
    'getSize': function(price) {
        if (this.bid.has(price)) {
            return this.bid.get(price);
        } else if (this.ask.has(price)) {
            return this.ask.get(price);
        }
        throw "Not found price: " + price;
    },
  
    // buy market order
    'buy': function(size) {
        if (size > this.cachedAskSize) {
            throw "Order size is bigger than total Ask size";
        }
        let askSize = 0;
        let askKey = 0;
        for (let i = 0; i < this.cachedSortedNonEmptyAsk.length; i++) {
            askKey = this.cachedSortedNonEmptyAsk[i];
            if (size > this.ask.get(askKey)) {
                size -= this.ask.get(askKey);
                this.ask.set(askKey, 0);
            } else {
                askSize = this.ask.get(askKey) - size;
                this.ask.set(askKey, askSize);
                break;
            }
        }
        this.updateAskCache();
    },
  
    // sell market order
    'sell': function(size) {
        if (size > this.cachedBidSize) {
            throw "Order size is bigger than total Bid size";
        }
        let bidSize = 0;
        let bidKey = 0;
        for (let i = 0; i < this.cachedSortedNonEmptyBid.length; i++) {
            bidKey = this.cachedSortedNonEmptyBid[i];
            if (size > this.bid.get(bidKey)) {
                size -= this.bid.get(bidKey);
                this.bid.set(bidKey, 0);
            } else {
                bidSize = this.bid.get(bidKey) - size;
                this.bid.set(bidKey, bidSize);
                break;
            }
        }
        this.updateBidCache();
    }
}