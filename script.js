$(document).ready(function () {
    mail_url = "https://script.google.com/macros/s/AKfycbxl89M-M-MggHi4c8RAjpQUT3QezF373Du73nToNVu_WnySpqpX9SD43JjOuWxbJAQu/exec"
    cart_datas = JSON.parse(localStorage.getItem('items')) || [];
    $('#no-of-items').html(`${cart_datas.length}`)
    console.log('cart:', cart_datas)
    $.ajax({
        url: "data.json",
        type: "GET",
        dataType: "json",
        success: function (datas) {
            datas.forEach((data) => {
                var foundItem = cart_datas.find(cartItem => cartItem.name === data.name);
                if (foundItem) {
                    quantity = foundItem.quantity;
                    console.log('quantity', quantity)
                } else {
                    quantity = 0;
                }
                item_div_html = `
                        <div class="item-div row">
                            <div class="col-4">
                                <div class="item-image">
                                    <img src="${data.image}" alt="">
                                </div>
                            </div>
                            <div class="col-5">
                                <div class="item-name">${data.name}</div>
                                <div class="item-per-serve">PER SERVE (${data.per_serve})</div>
                                <div class="item-description">${data.description}</div>
                                <div class="item-price">OMR &nbsp<span>${data.price}</span></div>
                            </div>
                            <div class="col-3 add-item-div">
                                <div class="add-item-btn">
                                        Add Item
                                </div>
                                <div class="item-count" style="display:none;">
                                    <div class="minus">-</div>
                                    <input type="text" disabled value="${quantity}" class="qty">
                                    <div class="plus">+</div>
                                </div>
                            </div>
                        </div>`

                //style="display:none;"
                if (data.category == 'Hot Drinks') {
                    $("#hotdrinks").append(item_div_html);
                }
                if (data.category == 'Cool Drinks') {
                    $("#cooldrinks").append(item_div_html);
                }
                if (data.category == 'Mojito') {
                    $("#mojito").append(item_div_html);
                }
                if (data.category == 'Extra') {
                    $("#extra").append(item_div_html);
                }
                if (data.category == 'Pastree') {
                    $("#pastree").append(item_div_html);
                }

                updateTotalPrice()

            });

            function updateTotalPrice() {
                let total = 0;
                $('.item-div').each(function () {
                    let quantity = parseInt($(this).find('.qty').val());
                    {
                        if (quantity != 0) {
                            // console.log('quantitty', quantity)
                            $(this).find(".add-item-btn").hide()
                            $(this).find(".item-count").show()
                            $(".total-price").show()
                            // $('#no-of-items').html(`${cart_datas.length}`)

                        }
                    }
                    let price = parseFloat($(this).find('.item-price span').text());
                    total += Math.round(price * quantity * 100) / 100;;
                });
                $('#price').text(`total price : OMR ${total}`);

                if (total > 0) $('#total-price').show()
                else $('#total-price ').hide()
                console.log(total)
            }

            function saveToLocalStorage() {
                let items = JSON.parse(localStorage.getItem('items')) || [];
                $('.item-div').each(function () {
                    let itemName = $(this).find('.item-name').text();
                    let itemPrice = parseFloat($(this).find('.item-price span').text());
                    let quantity = parseInt($(this).find('.qty').val());
                    let existingItem = items.find(item => item.name === itemName);
                    if (quantity > 0) {
                        if (existingItem) {
                            existingItem.quantity = quantity;
                        }
                        else {
                            items.push({
                                name: itemName,
                                price: itemPrice,
                                quantity: quantity
                            });
                        }

                    }
                    //else if (existingItem) 
                    else {
                        items = items.filter(item => item.name !== itemName);
                    }
                });
                localStorage.setItem('items', JSON.stringify(items));
                let ls = JSON.parse(localStorage.getItem('items'));
                $('#no-of-items').text(`${ls.length}`)
                console.log("Stored items in localStorage:", ls);
            }
            $('.item-category').hide();
            $('#hotdrinks').show();

            $('.add-item-btn').on('click', function () {
                $(this).hide()
                let item_count_field = $(this).siblings('.item-count')
                item_count_field.children('input').val(1);
                item_count_field.show();
                saveToLocalStorage()
                updateTotalPrice()
            })

            $('.plus').on('click', function () {
                let count = $(this).siblings('.qty')
                let currentValue = parseInt(count.val());
                count.val(currentValue + 1);
                saveToLocalStorage()
                updateTotalPrice()
            })

            $('.minus').on('click', function () {
                let count = $(this).siblings('.qty')
                let currentValue = parseInt(count.val());
                count.val(currentValue - 1);
                if (currentValue == 1) {
                    $(this).parents('.item-count').hide()
                    $(this).parents().siblings('.add-item-btn').show();
                }
                saveToLocalStorage()
                updateTotalPrice()
            })



            $('#hotdrinks_nav').on('click', function () {
                $('.item-category').hide();
                $('#hotdrinks').show();
                $('.nav-link').removeClass('selected');
                $(this).addClass('selected');
            })
            $('#cooldrinks_nav').on('click', function () {
                $('.item-category').hide();
                $('#cooldrinks').show();
                $('.nav-link').removeClass('selected');
                $(this).addClass('selected');
            })
            $('#mojito_nav').on('click', function () {
                $('.item-category').hide();
                $('#mojito').show();
                $('.nav-link').removeClass('selected');
                $(this).addClass('selected');
            })
            $('#extra_nav').on('click', function () {
                $('.item-category').hide();
                $('#extra').show();
                $('.nav-link').removeClass('selected');
                $(this).addClass('selected');
            })
            $('#pastree_nav').on('click', function () {
                $('.item-category').hide();
                $('#pastree').show();
                $('.nav-link').removeClass('selected');
                $(this).addClass('selected');
            })

            $('#make-order-btn').on('click', function () {
                $('header').hide();
                $('main').hide();
                $('#complete-order').show();
            })
            {
                $('#closebutton').on('click', () => {
                    $('header').show();
                    $('main').show();
                    $('#complete-order').hide();
                })
            }



        },
        error: function () {
            console.log("An error occurred while loading the JSON.");
        }
    });

    $("#order-submit-btn").on('click', function () {
        $('#complete-order').hide();
        $('#order-in-process').show();
        let ls = JSON.parse(localStorage.getItem('items'));
        let completedRequests = 0;

        $("#submit-form").submit((e) => {
            e.preventDefault()
            $('#f-details').empty()

            // let total = data.quantity * data.price

            // details_html = `
            //                 <input type="text" value="${data.name}" id="f-name" name="name" style="display: none;">
            //                 <input type="text" value="${data.price}" id="f-price" name="price" style="display: none;">
            //                 <input type="text" value="${data.quantity}" id="f-quantity" name="quantity" style="display: none;">
            //                 <input type="text" value="${total}" id="f-total" name="total" style="display: none;">
            //                `

            ls.forEach(function (data) {
                $('#od').append(`
                    [name: ${data.name},
                    price: ${data.price},
                    quantity: ${data.quantity}]
                    `)
            })

            od = document.getElementById('od').innerText
            console.log('od', od)
            details_html = `
                            <input type="text" value="${od}" id="f-name" name="order_data" style="display: none;">
                            `

            $('#f-details').append(details_html)

            $.ajax({
                url: mail_url,
                data: $("#submit-form").serialize(),
                method: "post",
                success: function (response) {
                    console.log("response", response)
                    completedRequests++;
                    // if (completedRequests === ls.length) {
                    localStorage.removeItem('items');
                    alert("Order completed successfully")
                    window.location.reload()
                    // }
                },
                error: function (err) {
                    alert("Something Error")
                }
            })
        })

    })
});