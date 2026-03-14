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
        Background Set
    --------------------*/
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
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
    var proQty = $('.pro-qty');
	proQty.prepend('<span class="dec qtybtn">-</span>');
	proQty.append('<span class="inc qtybtn">+</span>');
	proQty.on('click', '.qtybtn', function () {
		var $button = $(this);
		var oldValue = $button.parent().find('input').val();
		if ($button.hasClass('inc')) {
			var newVal = parseFloat(oldValue) + 1;
		} else {
			// Don't allow decrementing below zero
			if (oldValue > 0) {
				var newVal = parseFloat(oldValue) - 1;
			} else {
				newVal = 0;
			}
		}
		$button.parent().find('input').val(newVal);
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
        alert('Added to cart!');
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

    // Add to cart click event for product lists
    $('.product__hover li a:has(.icon_bag_alt)').on('click', function(e) {
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

        addToCart({
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    });

    // Add to cart click event for product details page
    $('.product__details__button .cart-btn').on('click', function(e) {
        e.preventDefault();
        var productName = $('.product__details__text h3').text().trim();
        var productPriceText = $('.product__details__price').text().trim();
        var productPrice = productPriceText.replace('$', '').replace(' ', '').trim();
        var productImage = $('.product__big__img').attr('src');
        var quantity = parseInt($('.pro-qty input').val()) || 1;

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