import { useState } from 'react';
import { getPaintings, savePainting, deletePainting, getReviews, getCommissions, updateCommissionStatus } from '../utils/storage';

const AdminDashboard = ({ onRefreshPaintings }) => {
  const [paintings, setPaintings] = useState(getPaintings() || []);
  const [commissions, setCommissions] = useState(getCommissions() || []);
  const reviews = getReviews() || [];
  const [activeTab, setActiveTab] = useState('overview');
  const [editingPainting, setEditingPainting] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Stats
  const totalPaintings = paintings.length;
  const soldPaintings = paintings.filter(p => p.availability === 'Sold').length;
  const inStockPaintings = paintings.filter(p => p.availability === 'In Stock').length;
  const lowStockPaintings = paintings.filter(p => p.availability === 'Low Stock').length;
  const totalReviews = reviews.length;
  const collections = [...new Set(paintings.map(p => p.collection))];
  const categories = [...new Set(paintings.map(p => p.subcategory))];

  const formatPrice = (p) => {
    if (p >= 1000000) return `₹${(p / 1000000).toFixed(1)}M`;
    return `₹${p.toLocaleString()}`;
  };

  // Add/Edit form state
  const emptyForm = {
    name: '', sku: '', description: '', story: '', inspiration: '', artistNotes: '',
    category: 'Paintings', subcategory: '', medium: 'Oil', style: 'Impressionism',
    collection: '', artist: 'Vincent van Gogh', price: '', discountPrice: '',
    availability: 'In Stock', images: [''],
    certificate: '', warranty: '', signature: '', year: '', dimensions: '',
    orientation: 'Landscape', frame: '', origin: 'France'
  };
  const [formData, setFormData] = useState(emptyForm);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (idx, value) => {
    const imgs = [...formData.images];
    imgs[idx] = value;
    setFormData({ ...formData, images: imgs });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const handleEditClick = (painting) => {
    setEditingPainting(painting.id);
    setFormData({
      name: painting.name, sku: painting.sku, description: painting.description,
      story: painting.story || '', inspiration: painting.inspiration || '',
      artistNotes: painting.artistNotes || '', category: painting.category,
      subcategory: painting.subcategory, medium: painting.medium, style: painting.style,
      collection: painting.collection, artist: painting.artist,
      price: painting.price, discountPrice: painting.discountPrice || '',
      availability: painting.availability, images: [...painting.images],
      certificate: painting.specifications.certificate, warranty: painting.specifications.warranty,
      signature: painting.specifications.signature, year: painting.specifications.year,
      dimensions: painting.specifications.dimensions, orientation: painting.specifications.orientation,
      frame: painting.specifications.frame, origin: painting.specifications.origin
    });
    setActiveTab('manage');
    setShowAddForm(true);
  };

  const handleSavePainting = (e) => {
    e.preventDefault();
    const paintingData = {
      id: editingPainting || `p_${Date.now()}`,
      sku: formData.sku, name: formData.name, description: formData.description,
      story: formData.story, inspiration: formData.inspiration, artistNotes: formData.artistNotes,
      category: formData.category, subcategory: formData.subcategory, medium: formData.medium,
      style: formData.style, collection: formData.collection, artist: formData.artist,
      price: Number(formData.price), discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
      rating: editingPainting ? (paintings.find(p => p.id === editingPainting)?.rating || 0) : 0,
      availability: formData.availability,
      images: formData.images.filter(i => i.trim()),
      specifications: {
        certificate: formData.certificate, warranty: formData.warranty,
        signature: formData.signature, year: formData.year,
        dimensions: formData.dimensions, orientation: formData.orientation,
        frame: formData.frame, origin: formData.origin
      },
      variants: editingPainting ? (paintings.find(p => p.id === editingPainting)?.variants || []) : [],
      reviewsCount: editingPainting ? (paintings.find(p => p.id === editingPainting)?.reviewsCount || 0) : 0
    };

    const updated = savePainting(paintingData);
    setPaintings(getPaintings());
    onRefreshPaintings();
    setShowAddForm(false);
    setEditingPainting(null);
    setFormData(emptyForm);
    alert(editingPainting ? 'Painting updated successfully!' : 'New painting added to the gallery!');
  };

  const handleDeletePainting = (id) => {
    if (window.confirm('Are you sure you want to remove this painting from the gallery?')) {
      deletePainting(id);
      setPaintings(getPaintings());
      onRefreshPaintings();
    }
  };

  const handleCommissionStatus = (id, status) => {
    updateCommissionStatus(id, status);
    setCommissions(getCommissions());
  };

  return (
    <main className="admin-page container">
      <h1>Curator Dashboard</h1>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`admin-tab ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>Manage Paintings</button>
        <button className={`admin-tab ${activeTab === 'commissions' ? 'active' : ''}`} onClick={() => setActiveTab('commissions')}>Commissions</button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <section className="admin-overview">
          <div className="stats-grid">
            <div className="glass-card stat-card">
              <div className="stat-icon">🖼️</div>
              <div className="stat-number">{totalPaintings}</div>
              <div className="stat-label">Total Paintings</div>
            </div>
            <div className="glass-card stat-card stat-green">
              <div className="stat-icon">🟢</div>
              <div className="stat-number">{inStockPaintings}</div>
              <div className="stat-label">In Stock</div>
            </div>
            <div className="glass-card stat-card stat-orange">
              <div className="stat-icon">🟠</div>
              <div className="stat-number">{lowStockPaintings}</div>
              <div className="stat-label">Low Stock</div>
            </div>
            <div className="glass-card stat-card stat-red">
              <div className="stat-icon">🔴</div>
              <div className="stat-number">{soldPaintings}</div>
              <div className="stat-label">Sold Out</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-icon">📁</div>
              <div className="stat-number">{collections.length}</div>
              <div className="stat-label">Collections</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-icon">🏷️</div>
              <div className="stat-number">{categories.length}</div>
              <div className="stat-label">Categories</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-number">{totalReviews}</div>
              <div className="stat-label">Reviews</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-number">{commissions.length}</div>
              <div className="stat-label">Commissions</div>
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockPaintings > 0 && (
            <div className="admin-alert glass-card">
              <h3>⚠️ Low Stock Alert</h3>
              <div className="alert-items">
                {paintings.filter(p => p.availability === 'Low Stock').map(p => (
                  <div key={p.id} className="alert-item">
                    <span>{p.name}</span>
                    <span className="badge badge-low-stock">Low Stock</span>
                    <button className="secondary-btn btn-sm" onClick={() => handleEditClick(p)}>Edit</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Manage Paintings Tab */}
      {activeTab === 'manage' && (
        <section className="admin-manage">
          <div className="manage-header-row">
            <h2>Gallery Inventory</h2>
            <button className="gold-btn" onClick={() => { setShowAddForm(!showAddForm); setEditingPainting(null); setFormData(emptyForm); }}>
              {showAddForm ? 'Cancel' : '+ Add Painting'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSavePainting} className="admin-form glass-card">
              <h3>{editingPainting ? 'Edit Painting' : 'Add New Painting'}</h3>
              <div className="form-grid-2col">
                <div className="input-group"><label>Painting Name *</label><input type="text" name="name" required value={formData.name} onChange={handleFormChange} /></div>
                <div className="input-group"><label>SKU Code *</label><input type="text" name="sku" required value={formData.sku} onChange={handleFormChange} /></div>
                <div className="input-group"><label>Subcategory</label><input type="text" name="subcategory" value={formData.subcategory} onChange={handleFormChange} /></div>
                <div className="input-group"><label>Medium</label>
                  <select name="medium" value={formData.medium} onChange={handleFormChange}>
                    <option value="Oil">Oil</option><option value="Acrylic">Acrylic</option>
                    <option value="Watercolor">Watercolor</option><option value="Charcoal">Charcoal</option>
                    <option value="Mixed Media">Mixed Media</option>
                  </select>
                </div>
                <div className="input-group"><label>Style</label><input type="text" name="style" value={formData.style} onChange={handleFormChange} /></div>
                <div className="input-group"><label>Collection</label><input type="text" name="collection" value={formData.collection} onChange={handleFormChange} /></div>
                <div className="input-group"><label>Price (USD) *</label><input type="number" name="price" required value={formData.price} onChange={handleFormChange} /></div>
                <div className="input-group"><label>Discount Price</label><input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleFormChange} /></div>
                <div className="input-group"><label>Availability</label>
                  <select name="availability" value={formData.availability} onChange={handleFormChange}>
                    <option value="In Stock">In Stock</option><option value="Low Stock">Low Stock</option><option value="Sold">Sold</option>
                  </select>
                </div>
                <div className="input-group"><label>Year Created</label><input type="text" name="year" value={formData.year} onChange={handleFormChange} /></div>
                <div className="input-group"><label>Dimensions</label><input type="text" name="dimensions" value={formData.dimensions} onChange={handleFormChange} /></div>
                <div className="input-group"><label>Orientation</label>
                  <select name="orientation" value={formData.orientation} onChange={handleFormChange}>
                    <option value="Landscape">Landscape</option><option value="Portrait">Portrait</option><option value="Square">Square</option>
                  </select>
                </div>
                <div className="input-group"><label>Frame</label><input type="text" name="frame" value={formData.frame} onChange={handleFormChange} /></div>
                <div className="input-group"><label>Certificate</label><input type="text" name="certificate" value={formData.certificate} onChange={handleFormChange} /></div>
              </div>
              <div className="input-group full-width"><label>Description *</label><textarea name="description" required rows="3" value={formData.description} onChange={handleFormChange} /></div>
              <div className="input-group full-width"><label>Story</label><textarea name="story" rows="2" value={formData.story} onChange={handleFormChange} /></div>
              
              {/* Image URLs */}
              <div className="input-group full-width">
                <label>Image URLs</label>
                {formData.images.map((img, idx) => (
                  <input key={idx} type="url" value={img} onChange={(e) => handleImageChange(idx, e.target.value)} placeholder={`Image URL ${idx + 1}`} style={{ marginBottom: '8px' }} />
                ))}
                <button type="button" className="secondary-btn btn-sm" onClick={addImageField}>+ Add Image URL</button>
              </div>

              <button type="submit" className="gold-btn btn-lg">{editingPainting ? 'Update Painting' : 'Add to Gallery'}</button>
            </form>
          )}

          {/* Inventory Table */}
          <div className="admin-table-wrapper glass-panel">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th><th>Name</th><th>SKU</th><th>Medium</th><th>Price</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paintings.map(p => (
                  <tr key={p.id}>
                    <td><img src={p.images?.[0]} alt={p.name} className="admin-thumb" /></td>
                    <td className="admin-name-cell">{p.name}</td>
                    <td className="sku-label">{p.sku}</td>
                    <td>{p.medium}</td>
                    <td className="text-gold">{formatPrice(p.discountPrice || p.price)}</td>
                    <td>
                      <span className={`badge ${p.availability === 'In Stock' ? 'badge-in-stock' : p.availability === 'Low Stock' ? 'badge-low-stock' : 'badge-sold'}`}>
                        {p.availability === 'In Stock' ? '🟢' : p.availability === 'Low Stock' ? '🟠' : '🔴'} {p.availability}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-btns">
                        <button className="secondary-btn btn-sm" onClick={() => handleEditClick(p)}>Edit</button>
                        <button className="danger-btn btn-sm" onClick={() => handleDeletePainting(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Commissions Tab */}
      {activeTab === 'commissions' && (
        <section className="admin-commissions">
          <h2>Commission Requests</h2>
          {commissions.length === 0 ? (
            <div className="glass-card empty-section-card"><p>No commission requests received yet.</p></div>
          ) : (
            <div className="commissions-admin-list">
              {commissions.map(c => (
                <div key={c.id} className="glass-card commission-admin-card">
                  <div className="comm-admin-header">
                    <div>
                      <h4>{c.userName}</h4>
                      <span className="text-muted">{c.email} | {c.date}</span>
                    </div>
                    <span className={`badge ${c.status === 'Approved' ? 'badge-in-stock' : c.status === 'Rejected' ? 'badge-sold' : 'badge-low-stock'}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="comm-details-grid">
                    <div><strong>Style:</strong> {c.style || 'Not specified'}</div>
                    <div><strong>Medium:</strong> {c.medium}</div>
                    <div><strong>Size:</strong> {c.size || 'Not specified'}</div>
                    <div><strong>Budget:</strong> ₹{c.budget?.toLocaleString() || 'Flexible'}</div>
                  </div>
                  {c.notes && <p className="comm-notes">"{c.notes}"</p>}
                  {c.status === 'Pending Review' && (
                    <div className="comm-admin-actions">
                      <button className="gold-btn btn-sm" onClick={() => handleCommissionStatus(c.id, 'Approved')}>Approve</button>
                      <button className="danger-btn btn-sm" onClick={() => handleCommissionStatus(c.id, 'Rejected')}>Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default AdminDashboard;
