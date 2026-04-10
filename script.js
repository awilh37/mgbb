const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")

bgcolor = "white"

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const keys = {
    d: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    w: {
        pressed: false,
    },
    s: {
        pressed: false
    }
}

const MAX_SPEED = 3

class Player {
    constructor(
        position,
        velocity,
        health = 100,
        color = "green",
        width = 50,
        height = 50
    ) {
        this.position = position
        this.velocity = velocity
        this.health = health
        this.color = color
        this.width = width
        this.height = height
    }

    draw() {
        c.fillStyle = this.color
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
        c.fillStyle = "red"
        c.fillRect(this.position.x, this.position.y - 10, this.width * (this.health / 100), 5)
    }

    update(dt) {
        this.position.x += this.velocity.x * dt
        this.position.y += this.velocity.y * dt
        this.draw()
    }
}

const player = new Player({ x: canvas.width / 2, y: canvas.height / 2 }, { x: 0, y: 0 })

function clampVelocityMagnitude(velocity, maxSpeed) {
    const magnitude = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)
    if (magnitude > maxSpeed) {
        velocity.x = (velocity.x / magnitude) * maxSpeed
        velocity.y = (velocity.y / magnitude) * maxSpeed
    }
}

function applyFriction(velocity, frictionAmount) {
    const magnitude = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)
    if (magnitude > 0) {
        const newMagnitude = Math.max(0, magnitude - frictionAmount)
        if (magnitude > 0) {
            velocity.x = (velocity.x / magnitude) * newMagnitude
            velocity.y = (velocity.y / magnitude) * newMagnitude
        }
    }
}

let lastTime = 0

function animate(currentTime) {
    const deltaTime = currentTime - lastTime
    lastTime = currentTime

    requestAnimationFrame(animate)
    c.fillStyle = bgcolor
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update(deltaTime)

    applyFriction(player.velocity, 0.25)

    if (keys.d.pressed) {
        player.velocity.x += 0.5
    } else if (keys.a.pressed) {
        player.velocity.x += -0.5
    }

    if (keys.s.pressed) {
        player.velocity.y += 0.5
    } else if (keys.w.pressed) {
        player.velocity.y += -0.5
    }
    
    if (player.position.x < 0) {
        player.position.x = 0;
        player.velocity.x = 0;
    }
    if (player.position.x > canvas.width - player.width) {
        player.position.x = canvas.width - player.width;
        player.velocity.x = 0;
    }
    if (player.position.y < 0) {
        player.position.y = 0;
        player.velocity.y = 0;
    }
    if (player.position.y > canvas.height - player.height) {
        player.position.y = canvas.height - player.height;
        player.velocity.y = 0;
    }    
    
    clampVelocityMagnitude(player.velocity, MAX_SPEED)
}

animate(0)

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = true
            break
        case 'a':
            keys.a.pressed = true
            break
        case 'w':
            keys.w.pressed = true
            break
        case 's':
            keys.s.pressed = true
            break
    }
}
)

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 'w':
            keys.w.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
    }
})

addEventListener('click', (event) => {
    console.log(`click`)
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
    )

    console.log(`angle: ${angle * (180 / Math.PI)} degrees`)
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    // projectiles.push(
    //     new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity)
    // )
})