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

const MAX_SPEED = 20
const ACCELERATION = 2
const FRICTION = 0.25
const SPAWN_RATE = 5000

let gameOn = true

class Player {
    constructor(
        position,
        velocity,
        health = 100,
        color = "green",
        width = 50,
        height = 50,
        damage = 10
    ) {
        this.position = position
        this.velocity = velocity
        this.health = health
        this.color = color
        this.width = width
        this.height = height
        this.damage = damage
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
    }
}

class Enemy {
    constructor(
        position,
        velocity,
        health = 100,
        color = "rgb(255, 0, 0)",
        width = 50,
        height = 50,
        speed = 10
    ) {
        this.position = position
        this.velocity = velocity
        this.health = health
        this.color = color
        this.width = width
        this.height = height
        this.speed = speed
        this.OGhealth = health
    }

    draw() {
        const redValue = Math.max(0, Math.min(255, Math.floor(255 * (this.health / this.OGhealth))))
        c.fillStyle = `rgb(${redValue}, 0, 0)`
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    update(dt) {
        const dirX = player.position.x - this.position.x
        const dirY = player.position.y - this.position.y
        const distance = Math.hypot(dirX, dirY)
        if (distance > 0) {
            this.velocity.x = (dirX / distance) * this.speed
            this.velocity.y = (dirY / distance) * this.speed
        }
        this.position.x += this.velocity.x * dt
        this.position.y += this.velocity.y * dt
    }

}

class Projectile {
    constructor(
        position,
        velocity,
        damage,
        radius
    ) {
        this.position = position
        this.velocity = velocity
        this.damage = damage
        this.radius = radius
    }

    draw() {
        c.fillStyle = "black"
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fill()
    }

    update(dt) {
        this.position.x += this.velocity.x * dt
        this.position.y += this.velocity.y * dt
    }
}

const player = new Player({ x: canvas.width / 2, y: canvas.height / 2 }, { x: 0, y: 0 })

const projectiles = []
const enemies = []

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

function isColliding(rect, circle) {
    const closestX = Math.max(rect.position.x, Math.min(circle.position.x, rect.position.x + rect.width))
    const closestY = Math.max(rect.position.y, Math.min(circle.position.y, rect.position.y + rect.height))

    const distanceX = circle.position.x - closestX
    const distanceY = circle.position.y - closestY

    return (distanceX ** 2 + distanceY ** 2) < (circle.radius ** 2)
}

function isRectColliding(rect1, rect2) {
    return (
        rect1.position.x < rect2.position.x + rect2.width &&
        rect1.position.x + rect1.width > rect2.position.x &&
        rect1.position.y < rect2.position.y + rect2.height &&
        rect1.position.y + rect1.height > rect2.position.y
    )
}


let lastTime = 0
let lastSpawnTime = 0

function animate(currentTime) {
    const deltaTime = Math.min(currentTime - lastTime, 100) / 16.6667
    lastTime = currentTime

    requestAnimationFrame(animate)
    c.fillStyle = bgcolor
    c.fillRect(0, 0, canvas.width, canvas.height)

    if (player.health <= 0) {
        c.fillStyle = "black"
        c.font = "48px serif"
        c.textAlign = "center"
        c.fillText("Game Over", canvas.width / 2, canvas.height / 2)
        enemies = []
        projectiles = []
        gameOn = false
    }

    if (gameOn) {
        const axisX = keys.d.pressed ? 1 : keys.a.pressed ? -1 : 0
        const axisY = keys.s.pressed ? 1 : keys.w.pressed ? -1 : 0
        const dirMag = Math.hypot(axisX, axisY)

        if (dirMag > 0) {
            player.velocity.x += (ACCELERATION * deltaTime) * axisX / dirMag
            player.velocity.y += (ACCELERATION * deltaTime) * axisY / dirMag
        }

        clampVelocityMagnitude(player.velocity, MAX_SPEED)
        applyFriction(player.velocity, FRICTION * deltaTime)

        player.update(deltaTime)

        if (player.position.x < 0) {
            player.position.x = 0
            player.velocity.x *= -1
        }
        if (player.position.x > canvas.width - player.width) {
            player.position.x = canvas.width - player.width
            player.velocity.x *= -1
        }
        if (player.position.y < 0) {
            player.position.y = 0
            player.velocity.y *= -1
        }
        if (player.position.y > canvas.height - player.height) {
            player.position.y = canvas.height - player.height
            player.velocity.y *= -1
        }

        player.draw()

        const now = currentTime
        if (now - lastSpawnTime > SPAWN_RATE) {
            enemies.push(new Enemy({ x: Math.random() * canvas.width, y: Math.random() * canvas.height }, { x: 0, y: 0 }, 30))
            lastSpawnTime = now
        }


        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i]
            for (let j = projectiles.length - 1; j >= 0; j--) {
                const projectile = projectiles[j]
                if (isColliding(enemy, projectile)) {
                    enemy.health -= projectile.damage
                    projectiles.splice(j, 1)
                    break
                }
            }

            if (enemy.health > 0) {
                enemy.update(deltaTime)
                if (isRectColliding(enemy, player)) {
                    player.health -= enemy.health
                    enemies.splice(i, 1)
                    continue
                }
                enemy.draw()
            } else {
                enemies.splice(i, 1)
            }
        }

        for (let j = projectiles.length - 1; j >= 0; j--) {
            const projectile = projectiles[j]
            projectile.update(deltaTime)
            projectile.draw()

            if (
                projectile.position.x < 0 ||
                projectile.position.x > canvas.width ||
                projectile.position.y < 0 ||
                projectile.position.y > canvas.height
            ) {
                projectiles.splice(j, 1)
            }
        }
    }
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
    const playerCenterX = player.position.x + player.width / 2
    const playerCenterY = player.position.y + player.height / 2

    const angle = Math.atan2(
        event.clientY - playerCenterY,
        event.clientX - playerCenterX
    )

    const distance = Math.hypot(
        event.clientX - playerCenterX,
        event.clientY - playerCenterY
    )

    const projectileSpeed = 4 * Math.log(distance + 1) + 2
    const velocity = {
        x: Math.cos(angle) * projectileSpeed + player.velocity.x,
        y: Math.sin(angle) * projectileSpeed + player.velocity.y
    }

    projectiles.push(new Projectile(
        { x: playerCenterX, y: playerCenterY },
        velocity,
        player.damage,
        5
    ))
})