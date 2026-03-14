/*
  Main JavaScript for Fix-It Forward store.
*/

'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        /*------------------
            Product filter
        --------------------*/
        $('.filter__controls li').on('click', function () {
            $('.filter__controls li').removeClass('active');
            $(this).addClass('active');
        });
        if ($('.property__gallery').length > 0) {
            var containerEl = document.querySelector('.property__gallery');
            var mixer = mixitup(containerEl);
        }
    });

    /*------------------
        Background Set (with hover swap support)
    --------------------*/
    $('.set-bg').each(function () {
        var $el = $(this);
        var bg = $el.data('setbg');
        $el.css('background-image', 'url(' + bg + ')');

        var hoverBg = $el.data('hoverbg');
        if (hoverBg) {
            $el.css('--hover-bg', 'url(' + hoverBg + ')');
        }
    });

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
            if(e.hash.split("-")[1] == num) {
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
    // For demo preview start
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    if(mm == 12) {
        mm = '01';
        yyyy = yyyy + 1;
    } else {
        mm = parseInt(mm) + 1;
        mm = String(mm).padStart(2, '0');
    }
    var timerdate = mm + '/' + dd + '/' + yyyy;
    // For demo preview end


    // Uncomment below and use your date //

    /* var timerdate = "2020/12/30" */

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

    // Delegated handler for quantity buttons (works across page transitions)
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
		Cart Logic
	--------------------- */
    var cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Product catalog used by product-details.html for routing
    var PRODUCT_DATA = {
        'shop-1': {
            id: 'shop-1',
            name: 'Buttons tweed blazer',
            brand: 'CozyCo',
            price: 59.0,
            compareAt: null,
            description: 'A polished tweed blazer that pairs perfectly with both trousers and skirts. Elevate your everyday style.',
            images: [
                'img/product/details/product-1.jpg',
                'img/product/details/product-2.jpg',
                'img/product/details/product-3.jpg',
                'img/product/details/product-4.jpg'
            ]
        },
        'shop-2': {
            id: 'shop-2',
            name: 'Flowy striped skirt',
            brand: 'Luna Threads',
            price: 49.0,
            compareAt: null,
            description: 'Lightweight midi skirt with a relaxed fit. Perfect for sunny days and brunch outings.',
            images: [
                'img/product/details/product-2.jpg',
                'img/product/details/product-1.jpg',
                'img/product/details/product-4.jpg',
                'img/product/details/product-3.jpg'
            ]
        },
        'shop-3': {
            id: 'shop-3',
            name: 'Croc-effect bag',
            brand: 'Urban Luxe',
            price: 59.0,
            compareAt: null,
            description: 'Sleek croc-effect bag with ample interior storage. A timeless accessory for every outfit.',
            images: [
                'img/product/details/product-3.jpg',
                'img/product/details/product-4.jpg',
                'img/product/details/product-1.jpg',
                'img/product/details/product-2.jpg'
            ]
        },
        'shop-4': {
            id: 'shop-4',
            name: 'Slim striped pocket shirt',
            brand: 'Denim Co.',
            price: 59.0,
            compareAt: null,
            description: 'A crisp, slim-fit shirt with a subtle striped pattern and a convenient chest pocket.',
            images: [
                'img/product/details/product-4.jpg',
                'img/product/details/product-1.jpg',
                'img/product/details/product-2.jpg',
                'img/product/details/product-3.jpg'
            ]
        },
        'shop-5': {
            id: 'shop-5',
            name: 'Fit micro corduroy shirt',
            brand: 'Stride',
            price: 59.0,
            compareAt: 59.0,
            description: 'Soft micro corduroy shirt with a tailored fit. Comfortable and versatile for everyday wear.',
            images: [
                'img/product/details/product-2.jpg',
                'img/product/details/product-3.jpg',
                'img/product/details/product-4.jpg',
                'img/product/details/product-1.jpg'
            ]
        },
        'shop-6': {
            id: 'shop-6',
            name: 'Tropical Kimono',
            brand: 'ShadeCraft',
            price: 59.0,
            compareAt: null,
            description: 'Lightweight kimono with tropical prints. Perfect for layering over your favorite outfit.',
            images: [
                'img/product/details/product-1.jpg',
                'img/product/details/product-2.jpg',
                'img/product/details/product-3.jpg',
                'img/product/details/product-4.jpg'
            ]
        },
        'shop-7': {
            id: 'shop-7',
            name: 'Circular pendant earrings',
            brand: 'Aurora',
            price: 59.0,
            compareAt: null,
            description: 'Lightweight circular pendants for everyday elegance. Perfect for layering with other jewelry.',
            images: [
                'img/product/details/product-3.jpg',
                'img/product/details/product-4.jpg',
                'img/product/details/product-1.jpg',
                'img/product/details/product-2.jpg'
            ]
        },
        'shop-8': {
            id: 'shop-8',
            name: 'Cotton T-Shirt',
            brand: 'Basics',
            price: 59.0,
            compareAt: null,
            description: 'Soft cotton tee with a relaxed fit. An essential piece for any wardrobe.',
            images: [
                'img/product/details/product-4.jpg',
                'img/product/details/product-1.jpg',
                'img/product/details/product-2.jpg',
                'img/product/details/product-3.jpg'
            ]
        },
        'shop-9': {
            id: 'shop-9',
            name: 'Water resistant zips backpack',
            brand: 'GearBag',
            price: 49.0,
            compareAt: 59.0,
            description: 'Durable backpack with water-resistant zippers and multiple compartments for daily use.',
            images: [
                'img/product/details/product-1.jpg',
                'img/product/details/product-3.jpg',
                'img/product/details/product-2.jpg',
                'img/product/details/product-4.jpg'
            ]
        }
    };

    function getProductFromQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get('id') || 'shop-1';
    }

    function initProductDetailsPage() {
        var $details = $('.product-details');
        if (!$details.length) return;

        var productId = getProductFromQuery();
        var product = PRODUCT_DATA[productId] || PRODUCT_DATA['shop-1'];

        // Update breadcrumb
        $('.breadcrumb__links span').text(product.name);

        // Update product title/brand
        $('.product__details__text h3').html(product.name + ' <span>Brand: ' + product.brand + '</span>');

        // Update price
        var $price = $('.product__details__price');
        if (product.compareAt) {
            $price.html('$ ' + product.price.toFixed(1) + ' <span>$ ' + product.compareAt.toFixed(1) + '</span>');
        } else {
            $price.text('$ ' + product.price.toFixed(1));
        }

        // Update description
        $('.product__details__tab #tabs-1').html('<h6>Description</h6><p>' + product.description + '</p>');

        // Update gallery
        var $thumbContainer = $('.product__details__pic .product__thumb');
        var $carousel = $('.product__details__pic__slider.owl-carousel');

        if ($thumbContainer.length && $carousel.length) {
            $thumbContainer.empty();
            $carousel.empty();

            product.images.forEach(function(src, index) {
                var hash = 'product-' + (index + 1);
                var thumb = '<a class="pt' + (index === 0 ? ' active' : '') + '" href="#' + hash + '"><img src="' + src + '" alt=""></a>';
                var slide = '<img data-hash="' + hash + '" class="product__big__img" src="' + src + '" alt="">';
                $thumbContainer.append(thumb);
                $carousel.append(slide);
            });

            // refresh owl carousel if already initialized
            if ($carousel.hasClass('owl-loaded')) {
                $carousel.trigger('destroy.owl.carousel');
            }
            $carousel.owlCarousel({
                loop: false,
                margin: 0,
                items: 1,
                dots: false,
                nav: true,
                navText: ['<i class="arrow_carrot-left"></i>', '<i class="arrow_carrot-right"></i>'],
                smartSpeed: 1200,
                autoHeight: false,
                autoplay: false,
                mouseDrag: false,
                startPosition: 'URLHash'
            }).on('changed.owl.carousel', function(event) {
                var indexNum = event.item.index + 1;
                product_thumbs(indexNum);
            });
        }

        // Update related product links (only the name links)
        $('.related__title + .row .product__item__text h6 a').each(function(index) {
            var relatedIds = ['shop-2','shop-3','shop-4','shop-5'];
            var id = relatedIds[index % relatedIds.length];
            $(this).attr('href', 'product-details.html?id=' + id);
        });
    }

    function initAppUI() {
        initQuantityButtons();
        initProductDetailsPage();
    }

    // Make available for page transition hooks
    window.initAppUI = initAppUI;

    // Initialize on first load
    $(function() {
        initAppUI();
    });

    function updateCartCount() {
        var totalCount = cart.reduce(function (total, item) {
            return total + item.quantity;
        }, 0);

        // Update both offcanvas and header cart tips
        $('.icon_bag_alt').siblings('.tip').text(totalCount);
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    // Call on load to set initial state
    updateCartCount();

    function flyToCart($productItem) {
        var $pic = $productItem.find('.product__item__pic');
        var rect;
        var bgImage;

        if ($pic.length) {
            rect = $pic[0].getBoundingClientRect();
            bgImage = $pic.css('background-image') || $pic.css('--hover-bg');
        } else {
            // Support product details page where image is an <img>
            var $img = $productItem.find('.product__big__img').first();
            if (!$img.length) return;
            rect = $img[0].getBoundingClientRect();
            bgImage = 'url(' + $img.attr('src') + ')';
        }

        var $cartIcon = $('.header__right__widget .icon_bag_alt').first();
        if (!$cartIcon.length) $cartIcon = $('.offcanvas__widget .icon_bag_alt').first();
        if (!$cartIcon.length) return;

        var cartRect = $cartIcon[0].getBoundingClientRect();
        var $fly = $('<div class="fly-to-cart"></div>');

        $fly.css({
            position: 'fixed',
            left: rect.left + 'px',
            top: rect.top + 'px',
            width: rect.width + 'px',
            height: rect.height + 'px',
            backgroundImage: bgImage,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 9999,
            pointerEvents: 'none',
            borderRadius: '8px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
        });

        $('body').append($fly);

        var targetX = cartRect.left - rect.left;
        var targetY = cartRect.top - rect.top;

        if (typeof gsap !== 'undefined') {
            gsap.to($fly[0], {
                duration: 0.8,
                x: targetX,
                y: targetY,
                scale: 0.22,
                opacity: 0,
                ease: 'power2.inOut',
                onComplete: function() {
                    $fly.remove();
                    gsap.fromTo($cartIcon[0], {scale: 1}, {scale: 1.2, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut'});
                }
            });
        } else {
            $fly.animate({
                left: cartRect.left + 'px',
                top: cartRect.top + 'px',
                width: '18px',
                height: '18px',
                opacity: 0
            }, 800, function() {
                $fly.remove();
            });
        }
    }

    function addToCart(product) {
        var existingProduct = cart.find(item => item.name === product.name);
        if (existingProduct) {
            existingProduct.quantity += product.quantity || 1;
        } else {
            cart.push({
                name: product.name,
                price: parseFloat(product.price),
                image: product.image,
                quantity: product.quantity || 1
            });
        }
        saveCart();
    }

    function removeFromCart(productName) {
        cart = cart.filter(item => item.name !== productName);
        saveCart();
    }

    function updateQuantity(productName, quantity) {
        var existingProduct = cart.find(item => item.name === productName);
        if (existingProduct) {
            existingProduct.quantity = parseInt(quantity);
            if (existingProduct.quantity <= 0) {
                removeFromCart(productName);
            } else {
                saveCart();
            }
        }
    }

    function clearCart() {
        cart = [];
        saveCart();
    }

    window.cart = cart;
    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.updateQuantity = updateQuantity;
    window.clearCart = clearCart;
    window.saveCart = saveCart;

    // Add to cart click event for product lists (delegated for Barba / dynamic page transitions)
    $(document).off('click', '.product__hover li a:has(.icon_bag_alt)').on('click', '.product__hover li a:has(.icon_bag_alt)', function(e) {
        e.preventDefault();
        var $productItem = $(this).closest('.product__item');
        var productName = $productItem.find('.product__item__text h6 a').text();
        var priceText = $productItem.find('.product__price').clone().children().remove().end().text().trim(); // remove span, keep text
        var productPrice = priceText.replace('$', '').trim();
        var productImage = $productItem.find('.product__item__pic').css('background-image').replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');

        // Handle images that might have hostnames, we want relative path
        if (productImage.includes(window.location.origin)) {
            productImage = productImage.replace(window.location.origin + '/', '');
        }

        flyToCart($productItem);
        addToCart({
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    });

    // Add to cart click event for product details page (delegated)
    $(document).off('click', '.product__details__button .cart-btn').on('click', '.product__details__button .cart-btn', function(e) {
        e.preventDefault();

        // Use only the product name (exclude brand span)
        var productName = $('.product__details__text h3').clone().children().remove().end().text().trim();
        var productPriceText = $('.product__details__price').text().trim();
        var productPrice = productPriceText.replace('$', '').replace(' ', '').trim();
        var productImage = $('.product__big__img').first().attr('src');
        var quantity = parseInt($('.pro-qty input').val()) || 1;

        flyToCart($('.product__details__pic'));
        addToCart({
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: quantity
        });
    });

    // Populate Shopping Cart page
    if ($('.shop-cart').length > 0) {
        function renderCartPage() {
            var $tbody = $('.shop__cart__table tbody');
            $tbody.empty();

            var total = 0;

            if (cart.length === 0) {
                $tbody.append('<tr><td colspan="5" class="text-center">Your cart is empty.</td></tr>');
            } else {
                cart.forEach(function(item) {
                    var itemTotal = item.price * item.quantity;
                    total += itemTotal;

                    var tr = `
                        <tr>
                            <td class="cart__product__item">
                                <img src="${item.image}" alt="" style="max-width: 90px;">
                                <div class="cart__product__item__title">
                                    <h6>${item.name}</h6>
                                </div>
                            </td>
                            <td class="cart__price">$ ${item.price.toFixed(1)}</td>
                            <td class="cart__quantity">
                                <div class="pro-qty" data-name="${item.name}">
                                    <span class="dec qtybtn">-</span>
                                    <input type="text" value="${item.quantity}">
                                    <span class="inc qtybtn">+</span>
                                </div>
                            </td>
                            <td class="cart__total">$ ${itemTotal.toFixed(1)}</td>
                            <td class="cart__close"><span class="icon_close" data-name="${item.name}"></span></td>
                        </tr>
                    `;
                    $tbody.append(tr);
                });
            }

            $('.cart__total__procced ul li:nth-child(1) span').text('$ ' + total.toFixed(1));
            $('.cart__total__procced ul li:nth-child(2) span').text('$ ' + total.toFixed(1));

            // Re-bind events for the dynamically added elements
            $('.shop__cart__table .qtybtn').on('click', function () {
                var $button = $(this);
                var $input = $button.parent().find('input');
                var oldValue = parseFloat($input.val());
                var newVal = oldValue;

                if ($button.hasClass('inc')) {
                    newVal = oldValue + 1;
                } else {
                    if (oldValue > 1) {
                        newVal = oldValue - 1;
                    } else {
                        newVal = 1;
                    }
                }
                $input.val(newVal);

                // Update cart immediately
                var productName = $button.parent().data('name');
                updateQuantity(productName, newVal);
                renderCartPage();
            });

            $('.shop__cart__table .icon_close').on('click', function() {
                var productName = $(this).data('name');
                removeFromCart(productName);
                renderCartPage();
            });
        }

        renderCartPage();

        $('.update__btn a').on('click', function(e) {
            e.preventDefault();
            renderCartPage();
        });
    }

    // Populate Checkout page
    if ($('.checkout').length > 0) {
        var $orderProductUl = $('.checkout__order__product ul');

        // Remove existing items except header
        $orderProductUl.find('li:not(:first)').remove();

        var total = 0;

        if (cart.length === 0) {
            $orderProductUl.append('<li>Cart is empty</li>');
        } else {
            cart.forEach(function(item, index) {
                var itemTotal = item.price * item.quantity;
                total += itemTotal;
                var itemNumber = (index + 1).toString().padStart(2, '0');
                var shortName = item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name;

                $orderProductUl.append(`<li>${itemNumber}. ${shortName} (x${item.quantity}) <span>$ ${itemTotal.toFixed(1)}</span></li>`);
            });
        }

        $('.checkout__order__total ul li:nth-child(1) span').text('$ ' + total.toFixed(1));
        $('.checkout__order__total ul li:nth-child(2) span').text('$ ' + total.toFixed(1));

        // Handle Place Order
        $('.checkout__order .site-btn').on('click', function(e) {
            e.preventDefault();
            if (cart.length === 0) {
                alert('Your cart is empty! Add some items before placing an order.');
                return;
            }
            alert('Order placed successfully! Thank you for your purchase.');
            clearCart();
            window.location.href = './index.html';
        });
    }

})(jQuery);