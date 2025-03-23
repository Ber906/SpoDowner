from flask import Blueprint, render_template

about_bp = Blueprint('about', __name__, url_prefix='/about')

@about_bp.route('/how-it-works')
def how_it_works():
    return render_template('about/how_it_works.html')

@about_bp.route('/terms')
def terms():
    return render_template('about/terms.html')

@about_bp.route('/privacy')
def privacy():
    return render_template('about/privacy.html')

@about_bp.route('/contact')
def contact():
    return render_template('about/contact.html')