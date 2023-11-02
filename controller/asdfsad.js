
$('#form-checkout').submit((e) => {
    e.preventDefault();


    $.ajax({
        url: '/checkout',
        method: 'POST',
        data: $('#form-checkout').serialize(),
        success: (response) => {
            console.log(response)
            if (response.paymentMethod === 'cod') {

                console.log(`/orderSuccess/${response.orderId}`);
                window.location.href = `/orderSuccess/${response.orderId}`
            } else {
                handlePayNowClick(response)
            }
        }
    })
})
function handlePayNowClick(order) {
    console.log(order, 'order');
    console.log(order.createdOrder.id, 'order.createdOrder.id');
    var options = {
        "key": "rzp_test_2kq1q9uS7VLUsv",
        "amount": order.createdOrder.amount * 100,
        "currency": "INR",
        "name": "Smasher",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.createdOrder.id,
        "handler": function (response) {
            console.log(response, 'inside hndkler')
            verifyPayment(response, order)
        },
        "prefill": {
            "name": "Gaurav Kumar", //your customer's name
            "email": "gaurav.kumar@example.com"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}

function verifyPayment(payment, order) {
    console.log('now in verifyPayment')
    $.ajax({
        url: '/verifyPayment',
        data: {
            payment,
            order
        },
        method: 'post',
        success: (response) => {
            if (response.success) {
                console.log('response got')
                window.location.href = `/orderSuccess/${response.orderId}`
            } else {
                console.log('response not get');
                location.href = '*'
            }
        }
    })
}
