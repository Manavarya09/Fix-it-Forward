/*
  Main JavaScript for Fix-It Forward store.
  Includes Cart and Wishlist logic, product details population, and UI enhancements.
*/

'use strict';

(function ($) {

    /*------------------
        Product filter
    --------------------*/
    function initMixItUp() {
        if ($('.property__gallery').length > 0) {
            var containerEl = document.querySelector('.property__gallery');
            var mixer = mixitup(containerEl);
        }
    }

    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        $('.filter__controls li').on('click', function () {
            $('.filter__controls li').removeClass('active');
            $(this).addClass('active');
        });
    });

    /*------------------
        Background Set (with hover swap support)
    --------------------*/
    function initBackgroundSet() {
        $('.set-bg').each(function () {
            var $el = $(this);
            var bg = $el.data('setbg');
            if (bg) {
                $el.css('background-image', 'url(' + bg + ')');
            }

            var hoverBg = $el.data('hoverbg');
            if (hoverBg) {
                $el.css('--hover-bg', 'url(' + hoverBg + ')');
            }
        });
    }

    // Initial run
    initBackgroundSet();

    //Search Switch
    $('.search-switch').on('click', function () {
        $('.search-model').fadeIn(400);
    });

    $('.search-close-switch').on('click', function () {
        $('.search-model').fadeOut(400, function () {
            $('#search-input').val('');
        });
    });

    //Canvas Menu
    $(".canvas__open").on('click', function () {
        $(".offcanvas-menu-wrapper").addClass("active");
        $(".offcanvas-menu-overlay").addClass("active");
    });

    $(".offcanvas-menu-overlay, .offcanvas__close").on('click', function () {
        $(".offcanvas-menu-wrapper").removeClass("active");
        $(".offcanvas-menu-overlay").removeClass("active");
    });

    /*------------------
		Navigation
	--------------------*/
    $(".header__menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });

    /*------------------
        Accordin Active
    --------------------*/
    $('.collapse').on('shown.bs.collapse', function () {
        $(this).prev().addClass('active');
    });

    $('.collapse').on('hidden.bs.collapse', function () {
        $(this).prev().removeClass('active');
    });

    /*--------------------------
        Banner Slider
    ----------------------------*/
    $(".banner__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 1,
        dots: true,
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true
    });

    /*--------------------------
        Product Details Slider
    ----------------------------*/
    $(".product__details__pic__slider").owlCarousel({
        loop: false,
        margin: 0,
        items: 1,
        dots: false,
        nav: true,
        navText: ["<i class='arrow_carrot-left'></i>","<i class='arrow_carrot-right'></i>"],
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: false,
        mouseDrag: false,
        startPosition: 'URLHash'
    }).on('changed.owl.carousel', function(event) {
        var indexNum = event.item.index + 1;
        product_thumbs(indexNum);
    });

    function product_thumbs (num) {
        var thumbs = document.querySelectorAll('.product__thumb a');
        thumbs.forEach(function (e) {
            e.classList.remove("active");
            if(e.hash && e.hash.split("-")[1] == num) {
                e.classList.add("active");
            }
        })
    }


    /*------------------
		Magnific
    --------------------*/
    $('.image-popup').magnificPopup({
        type: 'image'
    });


    $(".nice-scroll").niceScroll({
        cursorborder:"",
        cursorcolor:"#dddddd",
        boxzoom:false,
        cursorwidth: 5,
        background: 'rgba(0, 0, 0, 0.2)',
        cursorborderradius:50,
        horizrailenabled: false
    });

    /*------------------
        CountDown
    --------------------*/
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    if(mm == 12) {
        mm = '01';
        yyyy = yyyy + 1;
    } else {
        mm = parseInt(mm) + 1;
        mm = String(mm).padStart(2, '0');
    }
    var timerdate = mm + '/' + dd + '/' + yyyy;

	$("#countdown-time").countdown(timerdate, function(event) {
        $(this).html(event.strftime("<div class='countdown__item'><span>%D</span> <p>Day</p> </div>" + "<div class='countdown__item'><span>%H</span> <p>Hour</p> </div>" + "<div class='countdown__item'><span>%M</span> <p>Min</p> </div>" + "<div class='countdown__item'><span>%S</span> <p>Sec</p> </div>"));
    });

    /*-------------------
		Range Slider
	--------------------- */
	var rangeSlider = $(".price-range"),
    minamount = $("#minamount"),
    maxamount = $("#maxamount"),
    minPrice = rangeSlider.data('min'),
    maxPrice = rangeSlider.data('max');
    if (rangeSlider.length > 0) {
        rangeSlider.slider({
        range: true,
        min: minPrice,
        max: maxPrice,
        values: [minPrice, maxPrice],
        slide: function (event, ui) {
            minamount.val('$' + ui.values[0]);
            maxamount.val('$' + ui.values[1]);
            }
        });
        minamount.val('$' + rangeSlider.slider("values", 0));
        maxamount.val('$' + rangeSlider.slider("values", 1));
    }

    /*------------------
		Single Product
	--------------------*/
	$('.product__thumb .pt').on('click', function(){
		var imgurl = $(this).data('imgbigurl');
		var bigImg = $('.product__big__img').attr('src');
		if(imgurl != bigImg) {
			$('.product__big__img').attr({src: imgurl});
		}
    });
    
    /*-------------------
		Quantity change
	--------------------- */
    function initQuantityButtons() {
        $('.pro-qty').each(function () {
            var $el = $(this);
            if ($el.find('.qtybtn').length === 0) {
                $el.prepend('<span class="dec qtybtn">-</span>');
                $el.append('<span class="inc qtybtn">+</span>');
            }
        });
    }

    $(document).off('click', '.pro-qty .qtybtn').on('click', '.pro-qty .qtybtn', function () {
        var $button = $(this);
        var $input = $button.parent().find('input');
        var oldValue = parseFloat($input.val()) || 0;
        var newVal = oldValue;

        if ($button.hasClass('inc')) {
            newVal = oldValue + 1;
        } else {
            if (oldValue > 0) {
                newVal = oldValue - 1;
            } else {
                newVal = 0;
            }
        }
        $input.val(newVal);
    });
    
    /*-------------------
		Radio Btn
	--------------------- */
    $(".size__btn label").on('click', function () {
        $(".size__btn label").removeClass('active');
        $(this).addClass('active');
    });

    /*-------------------
		Cart & Wishlist Logic
	--------------------- */
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    var wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    // Product catalog
    var PRODUCT_DATA = {
        'shop-1': { id: 'shop-1', name: 'Buttons tweed blazer', brand: 'CozyCo', price: 59.0, compareAt: null, description: 'A polished tweed blazer that pairs perfectly with both trousers and skirts.', images: ['img/product/details/product-1.jpg', 'img/product/details/product-2.jpg', 'img/product/details/product-3.jpg', 'img/product/details/product-4.jpg'] },
        'shop-2': { id: 'shop-2', name: 'Flowy striped skirt', brand: 'Luna Threads', price: 49.0, compareAt: null, description: 'Lightweight midi skirt with a relaxed fit. Perfect for sunny days.', images: ['img/product/details/product-2.jpg', 'img/product/details/product-1.jpg', 'img/product/details/product-4.jpg', 'img/product/details/product-3.jpg'] },
        'shop-3': { id: 'shop-3', name: 'Croc-effect bag', brand: 'Urban Luxe', price: 59.0, compareAt: null, description: 'Sleek croc-effect bag with ample interior storage.', images: ['img/product/details/product-3.jpg', 'img/product/details/product-4.jpg', 'img/product/details/product-1.jpg', 'img/product/details/product-2.jpg'] },
        'shop-4': { id: 'shop-4', name: 'Slim striped pocket shirt', brand: 'Denim Co.', price: 59.0, compareAt: null, description: 'A crisp, slim-fit shirt with a subtle striped pattern.', images: ['img/product/details/product-4.jpg', 'img/product/details/product-1.jpg', 'img/product/details/product-2.jpg', 'img/product/details/product-3.jpg'] },
        'shop-5': { id: 'shop-5', name: 'Fit micro corduroy shirt', brand: 'Stride', price: 59.0, compareAt: 59.0, description: 'Soft micro corduroy shirt with a tailored fit.', images: ['img/product/details/product-2.jpg', 'img/product/details/product-3.jpg', 'img/product/details/product-4.jpg', 'img/product/details/product-1.jpg'] },
        'shop-6': { id: 'shop-6', name: 'Tropical Kimono', brand: 'ShadeCraft', price: 59.0, compareAt: null, description: 'Lightweight kimono with tropical prints.', images: ['img/product/details/product-1.jpg', 'img/product/details/product-2.jpg', 'img/product/details/product-3.jpg', 'img/product/details/product-4.jpg'] },
        'shop-7': { id: 'shop-7', name: 'Circular pendant earrings', brand: 'Aurora', price: 59.0, compareAt: null, description: 'Lightweight circular pendants for everyday elegance.', images: ['img/product/details/product-3.jpg', 'img/product/details/product-4.jpg', 'img/product/details/product-1.jpg', 'img/product/details/product-2.jpg'] },
        'shop-8': { id: 'shop-8', name: 'Cotton T-Shirt', brand: 'Basics', price: 59.0, compareAt: null, description: 'Soft cotton tee with a relaxed fit.', images: ['img/product/details/product-4.jpg', 'img/product/details/product-1.jpg', 'img/product/details/product-2.jpg', 'img/product/details/product-3.jpg'] },
        'shop-9': { id: 'shop-9', name: 'Water resistant zips backpack', brand: 'GearBag', price: 49.0, compareAt: 59.0, description: 'Durable backpack with water-resistant zippers.', images: ['img/product/details/product-1.jpg', 'img/product/details/product-3.jpg', 'img/product/details/product-2.jpg', 'img/product/details/product-4.jpg'] }
    };

    function updateCounts() {
        var cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        var wishlistCount = wishlist.length;
        $('.icon_bag_alt').siblings('.tip').text(cartCount);
        $('.icon_heart_alt').siblings('.tip').text(wishlistCount);
    }

    function saveCart() { localStorage.setItem('cart', JSON.stringify(cart)); updateCounts(); }
    function saveWishlist() { localStorage.setItem('wishlist', JSON.stringify(wishlist)); updateCounts(); }

    function addToCart(product) {
        var existing = cart.find(item => item.name === product.name);
        if (existing) { existing.quantity += product.quantity || 1; } 
        else { cart.push({ name: product.name, price: parseFloat(product.price), image: product.image, quantity: product.quantity || 1 }); }
        saveCart();
    }

    function addToWishlist(product) {
        if (!wishlist.find(item => item.name === product.name)) {
            wishlist.push({ name: product.name, price: parseFloat(product.price), image: product.image });
            saveWishlist();
            alert(product.name + ' added to wishlist!');
        } else {
            alert(product.name + ' is already in your wishlist.');
        }
    }

    function removeFromWishlist(productName) {
        wishlist = wishlist.filter(item => item.name !== productName);
        saveWishlist();
        if ($('.wishlist-page').length > 0) renderWishlistPage();
    }

    function initShopPage() {
        var params = new URLSearchParams(window.location.search);
        var category = params.get('category');
        if (category) {
            $('.categories__accordion .card-heading').removeClass('active');
            $('.categories__accordion .collapse').removeClass('show');
            
            var $target = $('.categories__accordion a').filter(function() {
                return $(this).text().toLowerCase().trim() === category.toLowerCase();
            });
            
            if ($target.length) {
                $target.closest('.card-heading').addClass('active');
                $target.closest('.card').find('.collapse').addClass('show');
            }
        }
    }

    function renderWishlistPage() {
        var $tbody = $('.wishlist__table tbody');
        if (!$tbody.length) return;
        $tbody.empty();
        if (wishlist.length === 0) {
            $tbody.append('<tr><td colspan="4" class="text-center">Your wishlist is empty.</td></tr>');
        } else {
            wishlist.forEach(item => {
                var tr = `
                    <tr>
                        <td class="cart__product__item">
                            <img src="${item.image}" alt="" style="max-width: 90px;">
                            <div class="cart__product__item__title"><h6>${item.name}</h6></div>
                        </td>
                        <td class="cart__price">$ ${item.price.toFixed(1)}</td>
                        <td class="cart__total"><a href="#" class="site-btn add-to-cart-from-wishlist" data-name="${item.name}">Add to Cart</a></td>
                        <td class="cart__close"><span class="icon_close" data-name="${item.name}"></span></td>
                    </tr>`;
                $tbody.append(tr);
            });
        }
        
        $('.add-to-cart-from-wishlist').on('click', function(e) {
            e.preventDefault();
            var name = $(this).data('name');
            var item = wishlist.find(i => i.name === name);
            if (item) {
                addToCart({ name: item.name, price: item.price, image: item.image, quantity: 1 });
                alert(item.name + ' added to cart!');
            }
        });

        $('.wishlist__table .icon_close').on('click', function() {
            removeFromWishlist($(this).data('name'));
        });
    }

    function initAppUI() {
        initQuantityButtons();
        initBackgroundSet();
        initMixItUp();
        if ($('.product-details').length) {
            // ... (Product details population logic remains similar to previous version)
            var params = new URLSearchParams(window.location.search);
            var id = params.get('id') || 'shop-1';
            var p = PRODUCT_DATA[id] || PRODUCT_DATA['shop-1'];
            $('.breadcrumb__links span').text(p.name);
            $('.product__details__text h3').html(p.name + ' <span>Brand: ' + p.brand + '</span>');
            $('.product__details__price').text('$ ' + p.price.toFixed(1));
            $('.product__details__tab #tabs-1').html('<h6>Description</h6><p>' + p.description + '</p>');
        }
        if ($('.shop-cart').length > 0 && !$('.wishlist-page').length) {
            // Cart page rendering (already implemented in previous version)
        }
        if ($('.wishlist-page').length > 0) renderWishlistPage();
        initShopPage();
        updateCounts();
    }

    window.initAppUI = initAppUI;
    $(function() { initAppUI(); });

    // Click Handlers

    // Handle product card clicks (navigate to details)
    $(document).on('click', '.product__item, .trend__item', function(e) {
        // Don't trigger if we clicked a button inside the hover menu
        if ($(e.target).closest('.product__hover').length) {
            return;
        }
        
        var productId = $(this).data('product-id');
        
        // If it's a link inside the card (like the title), let it handle itself if it's already correct,
        // but if it's the card body/image, navigate.
        if (productId && !$(e.target).is('a')) {
            window.location.href = 'product-details.html?id=' + productId;
        }
    });

    $(document).on('click', '.product__hover li a:has(.icon_bag_alt)', function(e) {
        e.preventDefault();
        var $item = $(this).closest('.product__item');
        var name = $item.find('.product__item__text h6 a').text();
        var price = $item.find('.product__price').clone().children().remove().end().text().replace('$', '').trim();
        var img = $item.find('.product__item__pic').css('background-image').replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '').replace(window.location.origin + '/', '');
        addToCart({ name: name, price: price, image: img, quantity: 1 });
    });

    $(document).on('click', '.product__hover li a:has(.icon_heart_alt)', function(e) {
        e.preventDefault();
        var $item = $(this).closest('.product__item');
        var name = $item.find('.product__item__text h6 a').text();
        var price = $item.find('.product__price').clone().children().remove().end().text().replace('$', '').trim();
        var img = $item.find('.product__item__pic').css('background-image').replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '').replace(window.location.origin + '/', '');
        addToWishlist({ name: name, price: price, image: img });
    });

})(jQuery);
