"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { listLikers } from "@/lib/likes";
import type { LikeTargetType, LikerUser } from "@/types/like";
import { Avatar } from "@/components/atoms";

const LIKERS_PAGE_SIZE = 20;

interface LikersModalProps {
  targetId: string;
  targetType: LikeTargetType;
  title?: string;
  onClose: () => void;
}

export function LikersModal({
  targetId,
  targetType,
  title = "People who liked this",
  onClose,
}: LikersModalProps) {
  const [users, setUsers] = useState<LikerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsers([]);
    setNextCursor(null);

    try {
      const result = await listLikers(targetId, targetType, LIKERS_PAGE_SIZE);
      setUsers(result.users);
      setNextCursor(result.nextCursor);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load likers");
    } finally {
      setLoading(false);
    }
  }, [targetId, targetType]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  async function loadMore() {
    if (!nextCursor || loadingMore) {
      return;
    }

    setLoadingMore(true);
    setError(null);

    try {
      const result = await listLikers(
        targetId,
        targetType,
        LIKERS_PAGE_SIZE,
        nextCursor
      );
      setUsers((current) => [...current, ...result.users]);
      setNextCursor(result.nextCursor);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load more likers");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div
      className="modal fade show d-block"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-content _feed_inner_area _b_radious6">
          <div className="modal-header border-0 _padd_l24 _padd_r24 _padd_t24">
            <h5 className="modal-title _title5">{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>
          <div
            className="modal-body _padd_l24 _padd_r24 _padd_b24"
            style={{ maxHeight: "60vh", overflowY: "auto" }}
          >
            {loading ? <p>Loading...</p> : null}
            {error ? <p className="text-danger">{error}</p> : null}
            {!loading && !error && users.length === 0 ? (
              <p>No likes yet.</p>
            ) : null}
            <ul className="list-unstyled _mar_t0">
              {users.map((user) => (
                <li key={user.id} className="_dis_flex _dis_flex_cntr1 _mar_b16">
                  <Avatar src={user.avatarUrl} className="_comment_img1" />
                  <span className="_mar_l12">
                    {user.firstName} {user.lastName}
                  </span>
                </li>
              ))}
            </ul>
            {nextCursor ? (
              <div className="_previous_comment">
                <button
                  type="button"
                  className="_previous_comment_txt"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "View more"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
