class AVLNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

class AVLTree {
    constructor() {
        this.root = null;
    }

    getHeight(node) {
        return node ? node.height : 0;
    }

    getBalanceFactor(node) {
        return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
    }

    updateHeight(node) {
        if (node) {
            node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
        }
    }

    rotateRight(y) {
        const x = y.left;
        const T2 = x.right;

        x.right = y;
        y.left = T2;

        this.updateHeight(y);
        this.updateHeight(x);

        return x;
    }

    rotateLeft(x) {
        const y = x.right;
        const T2 = y.left;

        y.left = x;
        x.right = T2;

        this.updateHeight(x);
        this.updateHeight(y);

        return y;
    }

    insert(node, value) {
        if (!node) {
            return new AVLNode(value);
        }

        if (value < node.value) {
            node.left = this.insert(node.left, value);
        } else if (value > node.value) {
            node.right = this.insert(node.right, value);
        } else {
            return node;
        }

        this.updateHeight(node);

        const balance = this.getBalanceFactor(node);

        if (balance > 1 && value < node.left.value) {
            return this.rotateRight(node);
        }

        if (balance < -1 && value > node.right.value) {
            return this.rotateLeft(node);
        }

        if (balance > 1 && value > node.left.value) {
            node.left = this.rotateLeft(node.left);
            return this.rotateRight(node);
        }

        if (balance < -1 && value < node.right.value) {
            node.right = this.rotateRight(node.right);
            return this.rotateLeft(node);
        }

        return node;
    }

    insertValue(value) {
        this.root = this.insert(this.root, value);
    }

    clear() {
        this.root = null;
    }

    countNodes(node) {
        if (!node) return 0;
        return 1 + this.countNodes(node.left) + this.countNodes(node.right);
    }

    getTreeHeight() {
        return this.getHeight(this.root);
    }
}

class TreeVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.tree = new AVLTree();
        this.nodeRadius = 30;
        this.verticalSpacing = 80;
        this.animationFrame = null;

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth - 60;
        this.canvas.height = Math.max(500, container.clientHeight - 60);
        this.draw();
    }

    calculatePositions(node, x, y, horizontalSpacing, positions) {
        if (!node) return;

        positions.set(node, { x, y });

        if (node.left) {
            this.calculatePositions(
                node.left,
                x - horizontalSpacing,
                y + this.verticalSpacing,
                horizontalSpacing / 2,
                positions
            );
        }

        if (node.right) {
            this.calculatePositions(
                node.right,
                x + horizontalSpacing,
                y + this.verticalSpacing,
                horizontalSpacing / 2,
                positions
            );
        }
    }

    drawCurvedLine(x1, y1, x2, y2) {
        const ctx = this.ctx;
        const controlPointOffset = Math.abs(x2 - x1) * 0.3;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(
            (x1 + x2) / 2,
            (y1 + y2) / 2 - controlPointOffset,
            x2,
            y2
        );
        ctx.strokeStyle = 'rgba(150, 150, 180, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawNode(x, y, value, balanceFactor) {
        const ctx = this.ctx;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;

        const gradient = ctx.createLinearGradient(
            x - this.nodeRadius,
            y - this.nodeRadius,
            x + this.nodeRadius,
            y + this.nodeRadius
        );
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.nodeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = 'transparent';

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Segoe UI';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value, x, y);

        ctx.font = 'bold 11px Segoe UI';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(`BF:${balanceFactor}`, x, y + this.nodeRadius + 15);
    }

    drawTree(node, positions) {
        if (!node) return;

        const pos = positions.get(node);

        if (node.left) {
            const leftPos = positions.get(node.left);
            this.drawCurvedLine(pos.x, pos.y + this.nodeRadius, leftPos.x, leftPos.y - this.nodeRadius);
            this.drawTree(node.left, positions);
        }

        if (node.right) {
            const rightPos = positions.get(node.right);
            this.drawCurvedLine(pos.x, pos.y + this.nodeRadius, rightPos.x, rightPos.y - this.nodeRadius);
            this.drawTree(node.right, positions);
        }

        const balanceFactor = this.tree.getBalanceFactor(node);
        this.drawNode(pos.x, pos.y, node.value, balanceFactor);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.tree.root) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.font = '20px Segoe UI';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('Tree is empty. Insert values to begin.', this.canvas.width / 2, this.canvas.height / 2);
            return;
        }

        const positions = new Map();
        const treeHeight = this.tree.getTreeHeight();
        const initialSpacing = Math.min(this.canvas.width / 4, 150);

        this.calculatePositions(
            this.tree.root,
            this.canvas.width / 2,
            60,
            initialSpacing,
            positions
        );

        this.drawTree(this.tree.root, positions);
    }

    insert(value) {
        this.tree.insertValue(value);
        this.draw();
        this.updateInfo();
    }

    clear() {
        this.tree.clear();
        this.draw();
        this.updateInfo();
    }

    updateInfo() {
        const nodeCount = this.tree.countNodes(this.tree.root);
        const treeHeight = this.tree.getTreeHeight();
        
        document.getElementById('nodeCount').textContent = `Nodes: ${nodeCount}`;
        document.getElementById('treeHeight').textContent = `Height: ${treeHeight}`;
    }
}

const visualizer = new TreeVisualizer('treeCanvas');

document.getElementById('insertBtn').addEventListener('click', () => {
    const input = document.getElementById('nodeValue');
    const value = parseInt(input.value);

    if (isNaN(value)) {
        alert('Please enter a valid number');
        return;
    }

    visualizer.insert(value);
    input.value = '';
    input.focus();
});

document.getElementById('nodeValue').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('insertBtn').click();
    }
});

document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the tree?')) {
        visualizer.clear();
    }
});

visualizer.draw();